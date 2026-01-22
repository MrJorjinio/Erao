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

        // Build chat history
        var history = conversation.Messages
            .OrderBy(m => m.CreatedAt)
            .Select(m => (m.Role == MessageRole.User ? "user" : "assistant", m.Content))
            .ToList();

        // Build system prompt
        var systemPrompt = BuildSystemPrompt(schemaContext);

        // Get AI response
        var (aiResponse, tokensUsed) = await _ollamaService.ChatAsync(request.Message, history, systemPrompt);

        // Try to extract SQL from response
        string? sqlQuery = null;
        string? queryResult = null;

        if (dbConnection != null && request.ExecuteQuery)
        {
            sqlQuery = ExtractSqlFromResponse(aiResponse);

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

IMPORTANT - Stay focused on databases ONLY:
- You MUST ONLY answer questions related to databases, SQL queries, data analysis, and the connected database schema
- If a user asks ANYTHING unrelated to databases (sports, celebrities, general knowledge, opinions, coding help, weather, news, etc.), politely decline
- For off-topic questions, respond with something like: 'I'm Erao, your database assistant! I can only help with database queries and data analysis. Try asking me something about your data, like ""How many customers do I have?"" or ""Show me top selling products.""'
- NEVER engage with off-topic conversations, debates, or general questions - always redirect to database topics
- Even if the user insists, stay focused on your database assistant role

When a user asks a data question:
1. Generate the SQL query wrapped in ```sql ... ``` blocks (this will be executed automatically and results shown to user)
2. Provide a friendly, conversational response with context about the results
3. Do NOT explain the SQL syntax or show the query to the user - they just want the answer
4. If you can't generate a query, explain why in simple terms

Response style:
- Start with a friendly intro like 'Here's what I found:', 'Based on your data:', 'I found the following:', etc.
- Be conversational and helpful
- Add brief insights or context about the results when relevant
- Example: 'Here's your oldest employee! Margaret Peacock has been with the company since 1937 and had her busiest day on February 26, 1998.'
- If results show something interesting, mention it briefly

SQL Query rules (CRITICAL):
- ALWAYS use DISTINCT when there's any possibility of duplicate rows from JOINs
- ALWAYS use column aliases to make results user-friendly:
  * Use 'AS FirstName' instead of showing 'first_name'
  * Use 'AS LastName' instead of showing 'last_name'
  * Use 'AS BirthDate' instead of showing 'birth_date'
  * Use 'AS TotalOrders' instead of showing 'count(*)'
  * Make all column names readable without underscores
- Use proper aggregation (GROUP BY) to avoid duplicates when counting or summarizing
- When finding 'the one' of something (oldest, newest, best), ensure only ONE row is returned using LIMIT 1 or proper subqueries
- Only generate SELECT queries unless explicitly asked for modifications
- Use proper SQL syntax for the database type
- Include appropriate JOINs when relationships exist
- Never generate DROP, DELETE, or UPDATE statements unless explicitly requested
";

        if (!string.IsNullOrEmpty(schemaContext))
        {
            prompt += $@"

The user's database has the following schema:
{schemaContext}

Use this schema to understand the database structure and generate accurate queries.";
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
}
