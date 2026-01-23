using System.Diagnostics;
using AutoMapper;
using Erao.Core.DTOs.Chat;
using Erao.Core.Entities;
using Erao.Core.Enums;
using Erao.Core.Interfaces;

namespace Erao.Application.Services;

public interface IChatService
{
    Task<ChatResponse> ProcessMessageAsync(Guid userId, ChatRequest request);
}

public class ChatService : IChatService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IOllamaService _ollamaService;
    private readonly IDatabaseQueryService _databaseQueryService;
    private readonly IEncryptionService _encryptionService;
    private readonly IMapper _mapper;

    public ChatService(
        IUnitOfWork unitOfWork,
        IOllamaService ollamaService,
        IDatabaseQueryService databaseQueryService,
        IEncryptionService encryptionService,
        IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _ollamaService = ollamaService;
        _databaseQueryService = databaseQueryService;
        _encryptionService = encryptionService;
        _mapper = mapper;
    }

    public async Task<ChatResponse> ProcessMessageAsync(Guid userId, ChatRequest request)
    {
        var stopwatch = Stopwatch.StartNew();

        // Validate user query limit
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null)
        {
            throw new UnauthorizedAccessException("User not found");
        }

        // Reset billing cycle if needed
        if (DateTime.UtcNow >= user.BillingCycleReset)
        {
            user.QueriesUsedThisMonth = 0;
            user.BillingCycleReset = DateTime.UtcNow.AddMonths(1);
        }

        if (user.QueriesUsedThisMonth >= user.QueryLimitPerMonth)
        {
            throw new InvalidOperationException("Query limit reached for this billing cycle");
        }

        // Get conversation
        var conversation = await _unitOfWork.Conversations.GetWithMessagesAsync(request.ConversationId);
        if (conversation == null || conversation.UserId != userId)
        {
            throw new InvalidOperationException("Conversation not found");
        }

        // Auto-generate conversation title from first message if empty (check before adding new message)
        var isFirstMessage = string.IsNullOrEmpty(conversation.Title) || conversation.Title == "New Chat";
        if (isFirstMessage && (conversation.Messages == null || conversation.Messages.Count == 0))
        {
            conversation.Title = GenerateTitle(request.Message);
            await _unitOfWork.Conversations.UpdateAsync(conversation);
        }

        // Save user message
        var userMessage = new Message
        {
            ConversationId = conversation.Id,
            Role = MessageRole.User,
            Content = request.Message
        };
        await _unitOfWork.Messages.AddAsync(userMessage);

        // Get schema context if database connection is set
        string? schemaContext = null;
        DatabaseConnection? dbConnection = null;

        if (conversation.DatabaseConnectionId.HasValue)
        {
            dbConnection = await _unitOfWork.DatabaseConnections.GetByIdAsync(conversation.DatabaseConnectionId.Value);
            if (dbConnection != null)
            {
                schemaContext = dbConnection.SchemaCache;

                if (string.IsNullOrEmpty(schemaContext))
                {
                    var host = _encryptionService.Decrypt(dbConnection.EncryptedHost);
                    var port = int.Parse(_encryptionService.Decrypt(dbConnection.EncryptedPort));
                    var database = _encryptionService.Decrypt(dbConnection.EncryptedDatabaseName);
                    var username = _encryptionService.Decrypt(dbConnection.EncryptedUsername);
                    var password = _encryptionService.Decrypt(dbConnection.EncryptedPassword);

                    schemaContext = await _databaseQueryService.GetSchemaAsync(
                        dbConnection.DatabaseType, host, port, database, username, password);

                    dbConnection.SchemaCache = schemaContext;
                    await _unitOfWork.DatabaseConnections.UpdateAsync(dbConnection);
                }
            }
        }

        // Build chat history from previous messages - include query results for context
        var history = (conversation.Messages ?? Enumerable.Empty<Message>())
            .OrderBy(m => m.CreatedAt)
            .Select(m => {
                var role = m.Role == MessageRole.User ? "user" : "assistant";
                var content = m.Content;

                // For assistant messages, append query results as natural language context
                if (m.Role == MessageRole.Assistant && !string.IsNullOrEmpty(m.QueryResult))
                {
                    try
                    {
                        using var doc = System.Text.Json.JsonDocument.Parse(m.QueryResult);
                        var root = doc.RootElement;
                        if (root.TryGetProperty("rows", out var rows) && rows.GetArrayLength() > 0)
                        {
                            var rowCount = rows.GetArrayLength();
                            if (rowCount == 1)
                            {
                                // Single row - format as "The result was: Column1=Value1, Column2=Value2"
                                var row = rows[0];
                                var values = new List<string>();
                                foreach (var prop in row.EnumerateObject())
                                {
                                    values.Add($"{prop.Name}: {prop.Value}");
                                }
                                content += $"\n\n(Query returned: {string.Join(", ", values)})";
                            }
                            else
                            {
                                // Multiple rows - just note the count
                                content += $"\n\n(Query returned {rowCount} rows of data)";
                            }
                        }
                    }
                    catch
                    {
                        // If JSON parsing fails, skip adding result context
                    }
                }

                return (role, content);
            })
            .ToList();

        // Build system prompt
        var systemPrompt = BuildSystemPrompt(schemaContext);

        // Get AI response with full conversation history
        var (aiResponse, tokensUsed) = await _ollamaService.ChatAsync(request.Message, history, systemPrompt);

        // Log the AI response for debugging
        Console.WriteLine($"[DEBUG] AI Response length: {aiResponse.Length}");
        Console.WriteLine($"[DEBUG] AI Response: {aiResponse}");

        // Try to extract SQL from response
        string? sqlQuery = null;
        string? queryResult = null;

        if (dbConnection != null && request.ExecuteQuery)
        {
            sqlQuery = ExtractSqlFromResponse(aiResponse);
            Console.WriteLine($"[DEBUG] Extracted SQL: {sqlQuery ?? "NULL"}");

            if (!string.IsNullOrEmpty(sqlQuery))
            {
                try
                {
                    var host = _encryptionService.Decrypt(dbConnection.EncryptedHost);
                    var port = int.Parse(_encryptionService.Decrypt(dbConnection.EncryptedPort));
                    var database = _encryptionService.Decrypt(dbConnection.EncryptedDatabaseName);
                    var username = _encryptionService.Decrypt(dbConnection.EncryptedUsername);
                    var password = _encryptionService.Decrypt(dbConnection.EncryptedPassword);

                    queryResult = await _databaseQueryService.ExecuteQueryAsync(
                        dbConnection.DatabaseType, host, port, database, username, password, sqlQuery);
                }
                catch (Exception ex)
                {
                    queryResult = $"Error executing query: {ex.Message}";
                }
            }
        }

        // Save assistant message
        var assistantMessage = new Message
        {
            ConversationId = conversation.Id,
            Role = MessageRole.Assistant,
            Content = aiResponse,
            SqlQuery = sqlQuery,
            QueryResult = queryResult,
            TokensUsed = tokensUsed
        };
        await _unitOfWork.Messages.AddAsync(assistantMessage);

        // Update user query count
        user.QueriesUsedThisMonth++;
        await _unitOfWork.Users.UpdateAsync(user);

        // Log usage
        stopwatch.Stop();
        var usageLog = new UsageLog
        {
            UserId = userId,
            DatabaseConnectionId = dbConnection?.Id,
            QueryType = sqlQuery != null ? "SQL" : "Chat",
            TokensUsed = tokensUsed,
            ExecutionTimeMs = (int)stopwatch.ElapsedMilliseconds
        };
        await _unitOfWork.UsageLogs.AddAsync(usageLog);

        await _unitOfWork.SaveChangesAsync();

        return new ChatResponse
        {
            UserMessage = _mapper.Map<MessageDto>(userMessage),
            AssistantMessage = _mapper.Map<MessageDto>(assistantMessage),
            QueryResult = queryResult,
            TokensUsed = tokensUsed
        };
    }

    private static string BuildSystemPrompt(string? schemaContext)
    {
        var prompt = @"You are Erao, an AI-powered database assistant. Your ONLY role is to help users query and understand their databases using natural language.

CRITICAL - USE CONVERSATION CONTEXT:
- ALWAYS remember and reference previous messages in this conversation
- If user asks a follow-up question like 'show me more details' or 'what about their sales?', understand they're referring to the previous topic
- Use pronouns correctly: 'them', 'it', 'those' refer to entities from previous messages
- Example: If user asked about 'best employee' and then asks 'what are their sales?', query sales for that same employee

IMPORTANT - Stay focused on databases ONLY:
- You MUST ONLY answer questions related to databases, SQL queries, data analysis, and the connected database schema
- If a user asks ANYTHING unrelated to databases, politely decline and redirect to database topics

CRITICAL - SQL FORMAT REQUIREMENT:
You MUST format SQL queries EXACTLY like this (this is mandatory):

```sql
SELECT COUNT(*) AS ""Total"" FROM tablename
```

- Start with triple backtick + sql
- Then your SQL query
- End with triple backtick
- Without this EXACT format, the query will NOT run
- NEVER use placeholders - query the real data directly
- NEVER ask user for IDs - just execute the query

CRITICAL - Column naming:
- Use double quotes for aliases: COUNT(*) AS ""Total Count""

IMPORTANT - QUERY RESULTS:
- Results display automatically - just provide the SQL query
- Do not state specific numbers - let the result card show them

CRITICAL - TABLE NAME CASE SENSITIVITY:
- PostgreSQL is case-sensitive for table and column names
- You MUST use the EXACT table names as shown in the schema (with proper PascalCase)
- ALWAYS wrap table names in double quotes to preserve case: FROM ""Posts"" not FROM posts
- Example: SELECT COUNT(*) FROM ""Videos"" (not FROM videos)
- Example: SELECT * FROM ""Comments"" WHERE ""PostId"" = 1

SQL Query rules:
- ALWAYS use DISTINCT when there's any possibility of duplicate rows from JOINs
- Use proper aggregation (GROUP BY) to avoid duplicates
- When finding 'the one' of something, use LIMIT 1
- Only generate SELECT queries unless explicitly asked for modifications
- Never generate DROP, DELETE, or UPDATE statements unless explicitly requested
";

        if (!string.IsNullOrEmpty(schemaContext))
        {
            prompt += $@"

The user's database has the following schema:
{schemaContext}

IMPORTANT: Use this schema to understand the database structure. Use the EXACT table and column names as shown above, wrapped in double quotes to preserve case sensitivity.";
        }
        else
        {
            prompt += @"

No database schema is available. You can help with general SQL questions or ask the user to connect a database.";
        }

        return prompt;
    }

    private static string? ExtractSqlFromResponse(string response)
    {
        // Try to extract SQL from markdown code blocks
        var sqlStartMarkers = new[] { "```sql", "```SQL", "```" };
        var endMarker = "```";

        foreach (var startMarker in sqlStartMarkers)
        {
            var startIndex = response.IndexOf(startMarker, StringComparison.OrdinalIgnoreCase);
            if (startIndex >= 0)
            {
                startIndex += startMarker.Length;
                var endIndex = response.IndexOf(endMarker, startIndex, StringComparison.OrdinalIgnoreCase);
                if (endIndex > startIndex)
                {
                    var sql = response.Substring(startIndex, endIndex - startIndex).Trim();
                    if (IsSafeQuery(sql))
                    {
                        return sql;
                    }
                }
            }
        }

        return null;
    }

    private static bool IsSafeQuery(string sql)
    {
        var upperSql = sql.ToUpperInvariant();
        var dangerousKeywords = new[] { "DROP", "DELETE", "TRUNCATE", "ALTER", "CREATE", "INSERT", "UPDATE", "EXEC", "EXECUTE" };

        foreach (var keyword in dangerousKeywords)
        {
            if (upperSql.Contains(keyword))
            {
                return false;
            }
        }

        return upperSql.StartsWith("SELECT") || upperSql.StartsWith("WITH");
    }

    private static string GenerateTitle(string message)
    {
        // Clean up the message and take first 50 characters
        var cleaned = message.Trim();

        // Remove common filler words at the start
        var fillerPrefixes = new[] { "can you ", "please ", "i want to ", "show me ", "get me ", "find ", "what is ", "what are " };
        foreach (var prefix in fillerPrefixes)
        {
            if (cleaned.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            {
                cleaned = cleaned.Substring(prefix.Length).TrimStart();
                break;
            }
        }

        // Capitalize first letter
        if (cleaned.Length > 0)
        {
            cleaned = char.ToUpper(cleaned[0]) + cleaned.Substring(1);
        }

        // Truncate to 50 characters max
        if (cleaned.Length > 50)
        {
            cleaned = cleaned.Substring(0, 47) + "...";
        }

        return string.IsNullOrEmpty(cleaned) ? "New Chat" : cleaned;
    }
}
