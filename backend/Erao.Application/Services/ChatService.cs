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

        // Get schema context if database connection or file is set
        string? schemaContext = null;
        string? fileDataContext = null;
        DatabaseConnection? dbConnection = null;
        FileDocument? fileDocument = null;

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
        else if (conversation.FileDocumentId.HasValue)
        {
            fileDocument = await _unitOfWork.FileDocuments.GetByIdAsync(conversation.FileDocumentId.Value);
            if (fileDocument != null)
            {
                schemaContext = fileDocument.SchemaInfo;
                fileDataContext = fileDocument.ParsedContent;
            }
        }

        // Build chat history from previous messages - include query results for context
        // Use [DATA_CONTEXT] tags so AI understands this is reference info, not text to repeat
        var history = (conversation.Messages ?? Enumerable.Empty<Message>())
            .OrderBy(m => m.CreatedAt)
            .Select(m => {
                var role = m.Role == MessageRole.User ? "user" : "assistant";
                var content = m.Content;

                // For assistant messages, append query results as context for follow-up questions
                // Format as hidden context that AI should reference but NOT repeat in responses
                if (m.Role == MessageRole.Assistant && !string.IsNullOrEmpty(m.QueryResult))
                {
                    try
                    {
                        using var doc = System.Text.Json.JsonDocument.Parse(m.QueryResult);
                        var root = doc.RootElement;
                        if (root.TryGetProperty("rows", out var rows) && rows.GetArrayLength() > 0)
                        {
                            var rowCount = rows.GetArrayLength();
                            if (rowCount <= 5)
                            {
                                // Small result set - include actual data for context
                                var dataLines = new List<string>();
                                foreach (var row in rows.EnumerateArray())
                                {
                                    var vals = new List<string>();
                                    foreach (var prop in row.EnumerateObject())
                                    {
                                        vals.Add($"{prop.Name}={prop.Value}");
                                    }
                                    dataLines.Add(string.Join(", ", vals));
                                }
                                content += $"\n[DATA_CONTEXT: {rowCount} row(s): {string.Join(" | ", dataLines)}]";
                            }
                            else
                            {
                                // Large result set - just note the count
                                content += $"\n[DATA_CONTEXT: Query returned {rowCount} rows]";
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

        // Build system prompt - different for database vs file
        var systemPrompt = fileDocument != null
            ? BuildFileSystemPrompt(schemaContext, fileDataContext, fileDocument.OriginalFileName)
            : BuildSystemPrompt(schemaContext);

        // Get AI response with full conversation history
        var (aiResponse, tokensUsed) = await _ollamaService.ChatAsync(request.Message, history, systemPrompt);

        // Try to extract SQL from response (for database mode) or analyze file data
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
            else
            {
                // Fallback: If AI returned [DATA_CONTEXT] without SQL, parse it as data
                queryResult = ExtractDataContextAsResult(aiResponse);
            }
        }
        else if (fileDocument != null)
        {
            // For file-based conversations, extract JSON data for table display
            queryResult = ExtractJsonBlock(aiResponse);

            // Fallback: If no JSON block but has [DATA_CONTEXT], parse that
            if (string.IsNullOrEmpty(queryResult))
            {
                queryResult = ExtractDataContextAsResult(aiResponse);
            }
        }

        // Clean the response - remove code blocks that are now in queryResult
        var cleanedContent = StripCodeBlocks(aiResponse);

        // Save assistant message
        var assistantMessage = new Message
        {
            ConversationId = conversation.Id,
            Role = MessageRole.Assistant,
            Content = cleanedContent,
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

        var assistantDto = _mapper.Map<MessageDto>(assistantMessage);

        return new ChatResponse
        {
            UserMessage = _mapper.Map<MessageDto>(userMessage),
            AssistantMessage = assistantDto,
            QueryResult = queryResult,
            TokensUsed = tokensUsed
        };
    }

    private static string BuildSystemPrompt(string? schemaContext)
    {
        var prompt = """
You are Erao, an AI-powered database assistant. Help users query and understand their databases using natural language.

## Scope
- ONLY answer database-related questions (SQL, data analysis, schema)
- Politely redirect unrelated questions back to database topics

## Conversation Context
- Remember previous messages and resolve pronouns ("them", "it", "those")
- Handle follow-ups naturally (e.g., "what are their sales?" refers to the previous entity)
- [DATA_CONTEXT] tags show previous results - use them to understand context but NEVER output them

## CRITICAL Response Rules
1. EVERY answer about data MUST include a ```sql code block - NO EXCEPTIONS
2. Even for follow-up questions like "what about the second one?" - write a NEW SQL query
3. NEVER just state data values without a SQL query - the UI needs the query to display results
4. If user asks about previous results, write a query that fetches that specific data

Structure:
1. Brief acknowledgment (optional)
2. SQL query in ```sql block
3. Brief explanation (if needed)

✓ Correct:
User: Show me all orders
Assistant: Here are the orders:
```sql
SELECT * FROM "Orders" LIMIT 100
```

✓ Correct follow-up:
User: What about the third highest spender?
Assistant: Here's the third highest spender:
```sql
SELECT "CustomerName", SUM("Total") AS "TotalSpent" FROM "Orders" GROUP BY "CustomerName" ORDER BY "TotalSpent" DESC LIMIT 1 OFFSET 2
```

✗ Wrong (NO SQL = data won't display):
User: What about the third one?
Assistant: The third highest spender is John Smith with $50,000.

Rules:
- Start with SQL immediately—no "I will", "Let me", "Here's what I'll do"
- Never use placeholders like [value]—use real column/table names
- Never ask for clarification—write the best query possible
- NEVER output [DATA_CONTEXT], query results, row counts, or data values in your response
- The UI automatically displays query results—just provide the SQL query

## SQL Syntax (PostgreSQL)
- Case-sensitive: Use exact names from schema (PascalCase)
- Always wrap identifiers in double quotes: FROM "Videos" not FROM videos
- Use double quotes for aliases: COUNT(*) AS "Total Count"
- Only SELECT unless modifications explicitly requested
- Use DISTINCT when JOINs might produce duplicates
- Use LIMIT 1 when finding "the one" of something

## Ordering for Charts
Results display as charts. Make them meaningful:

Column order:
- First: Label/category (name, title, date)
- Second+: Numeric values (amount, count, total)

Sorting:
- "Top X" / "Highest" / "Lowest" → ORDER BY value column DESC/ASC
- Time-series → ORDER BY date ASC

✓ Correct: ORDER BY "TotalSales" DESC
✗ Wrong: ORDER BY "CustomerId" or ORDER BY "PostalCode"

## Explaining Calculations
When asked HOW something was calculated:
- Explain the formula in plain language, NOT SQL
- Example: "Profit = Revenue - Cost, where Revenue = UnitPrice × Quantity"
- Do NOT include SQL—they want the math, not code
""";

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
        // Try to extract SQL from markdown code blocks - multiple patterns
        var patterns = new[]
        {
            ("```sql", "```"),      // Standard SQL block
            ("```SQL", "```"),      // Uppercase
            ("```\nSELECT", "```"), // Generic block starting with SELECT
            ("```\nWITH", "```"),   // Generic block starting with WITH
        };

        foreach (var (startMarker, endMarker) in patterns)
        {
            var startIndex = response.IndexOf(startMarker, StringComparison.OrdinalIgnoreCase);
            if (startIndex >= 0)
            {
                // Skip past the marker but keep SELECT/WITH if that's what we matched
                var offset = startMarker.StartsWith("```\n") ? 4 : startMarker.Length; // Skip ``` and newline
                startIndex += offset;

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

        // Fallback: Try to find raw SELECT or WITH statements if no code block found
        var lines = response.Split('\n');
        var sqlLines = new List<string>();
        var inSql = false;

        foreach (var line in lines)
        {
            var trimmedLine = line.Trim();
            var upperLine = trimmedLine.ToUpperInvariant();

            // Start capturing when we see SELECT or WITH at the start of a line
            if (!inSql && (upperLine.StartsWith("SELECT ") || upperLine.StartsWith("WITH ")))
            {
                inSql = true;
            }

            if (inSql)
            {
                // Stop if we hit an empty line or text that doesn't look like SQL
                if (string.IsNullOrWhiteSpace(trimmedLine))
                {
                    break;
                }
                // Stop if line starts with common non-SQL patterns
                if (trimmedLine.StartsWith("This ") || trimmedLine.StartsWith("The ") ||
                    trimmedLine.StartsWith("I ") || trimmedLine.StartsWith("Here"))
                {
                    break;
                }
                sqlLines.Add(trimmedLine);
            }
        }

        if (sqlLines.Count > 0)
        {
            var sql = string.Join("\n", sqlLines);
            if (IsSafeQuery(sql))
            {
                return sql;
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

    private static string? ExtractDataContextAsResult(string response)
    {
        // Parse [DATA_CONTEXT: N row(s): key=value, key=value | key=value, key=value]
        var match = System.Text.RegularExpressions.Regex.Match(
            response,
            @"\[DATA_CONTEXT:\s*(\d+)\s*row\(s\):\s*(.+?)\]",
            System.Text.RegularExpressions.RegexOptions.IgnoreCase | System.Text.RegularExpressions.RegexOptions.Singleline
        );

        if (!match.Success) return null;

        var rowsData = match.Groups[2].Value;
        var rowStrings = rowsData.Split('|', StringSplitOptions.RemoveEmptyEntries);

        var columns = new List<string>();
        var rows = new List<Dictionary<string, object>>();

        foreach (var rowStr in rowStrings)
        {
            var row = new Dictionary<string, object>();
            var pairs = rowStr.Split(',', StringSplitOptions.RemoveEmptyEntries);

            foreach (var pair in pairs)
            {
                var parts = pair.Split('=', 2);
                if (parts.Length == 2)
                {
                    var key = parts[0].Trim();
                    var value = parts[1].Trim();

                    // Add column if not seen before
                    if (!columns.Contains(key))
                    {
                        columns.Add(key);
                    }

                    // Try to parse as number
                    if (double.TryParse(value, out var numValue))
                    {
                        row[key] = numValue;
                    }
                    else
                    {
                        row[key] = value;
                    }
                }
            }

            if (row.Count > 0)
            {
                rows.Add(row);
            }
        }

        if (rows.Count == 0) return null;

        // Build JSON result
        var result = new
        {
            columns = columns,
            rows = rows,
            rowCount = rows.Count
        };

        return System.Text.Json.JsonSerializer.Serialize(result);
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

    private static string BuildFileSystemPrompt(string? schemaContext, string? fileDataContext, string fileName)
    {
        var prompt = $@"You are Erao, a data analyst assistant helping with a file named '{fileName}'.

## CRITICAL Response Rules - READ CAREFULLY
1. EVERY answer showing specific data MUST include a ```json code block - NO EXCEPTIONS
2. Even for follow-up questions like ""what about the third one?"" - include a NEW JSON block with that data
3. NEVER just state data values in plain text - the UI needs the JSON to display results visually
4. If user asks about previous results, include a JSON block with that specific data
5. [DATA_CONTEXT] tags show previous results - use them for context but NEVER output them

RESPONSE FORMAT:
```json
{{""columns"": [""Column1"", ""Column2""], ""rows"": [{{""Column1"": ""value"", ""Column2"": ""value""}}], ""rowCount"": 1}}
```

Keep explanatory text brief - data displays as a visual card/table automatically.

✓ Correct follow-up:
User: ""What about the third highest?""
Assistant: Here's the third highest spender:
```json
{{""columns"": [""Name"", ""Total""], ""rows"": [{{""Name"": ""John"", ""Total"": 5000}}], ""rowCount"": 1}}
```

✗ Wrong (NO JSON = data won't display):
User: ""What about the third highest?""
Assistant: The third highest spender is John with $5000.

## Data Ordering for Charts
- FIRST column: label/category (name, title, date)
- SECOND+ columns: numeric values (amount, count, total)
- Sort by value column for ""top X"" queries, by date for time-series

## Rules
- Do NOT generate SQL - this is file data
- Remember previous messages for context
";

        if (!string.IsNullOrEmpty(schemaContext))
        {
            prompt += $@"

The file has the following structure (columns):
{schemaContext}
";
        }

        if (!string.IsNullOrEmpty(fileDataContext))
        {
            // Limit data context to avoid token limits (take first ~50 rows)
            var dataPreview = TruncateDataContext(fileDataContext, 50);
            prompt += $@"

Here is the data from the file (first rows):
{dataPreview}

Use this data to answer the user's questions. Calculate statistics, find patterns, and provide insights as requested.";
        }

        return prompt;
    }

    private static string TruncateDataContext(string jsonData, int maxRows)
    {
        try
        {
            using var doc = System.Text.Json.JsonDocument.Parse(jsonData);
            var root = doc.RootElement;

            if (root.ValueKind == System.Text.Json.JsonValueKind.Array)
            {
                var rows = new List<System.Text.Json.JsonElement>();
                foreach (var item in root.EnumerateArray())
                {
                    if (rows.Count >= maxRows) break;
                    rows.Add(item);
                }

                return System.Text.Json.JsonSerializer.Serialize(rows);
            }
        }
        catch
        {
            // If parsing fails, just truncate the string
            if (jsonData.Length > 10000)
            {
                return jsonData.Substring(0, 10000) + "... (truncated)";
            }
        }

        return jsonData;
    }

    private static string? ExtractJsonBlock(string response)
    {
        try
        {
            var jsonStart = response.IndexOf("```json", StringComparison.OrdinalIgnoreCase);
            if (jsonStart >= 0)
            {
                jsonStart += 7; // Skip "```json"
                var jsonEnd = response.IndexOf("```", jsonStart, StringComparison.OrdinalIgnoreCase);
                if (jsonEnd > jsonStart)
                {
                    var jsonStr = response.Substring(jsonStart, jsonEnd - jsonStart).Trim();
                    // Validate it's proper JSON with expected structure
                    using var doc = System.Text.Json.JsonDocument.Parse(jsonStr);
                    var root = doc.RootElement;
                    if (root.TryGetProperty("columns", out _) && root.TryGetProperty("rows", out _))
                    {
                        return jsonStr;
                    }
                }
            }
        }
        catch
        {
            // JSON extraction failed
        }
        return null;
    }

    private static string StripCodeBlocks(string content)
    {
        // Remove JSON code blocks
        content = System.Text.RegularExpressions.Regex.Replace(
            content, @"```json[\s\S]*?```", "", System.Text.RegularExpressions.RegexOptions.IgnoreCase);

        // Remove SQL code blocks
        content = System.Text.RegularExpressions.Regex.Replace(
            content, @"```sql[\s\S]*?```", "", System.Text.RegularExpressions.RegexOptions.IgnoreCase);

        // Clean up extra whitespace
        content = System.Text.RegularExpressions.Regex.Replace(content, @"\n{3,}", "\n\n");

        return content.Trim();
    }
}
