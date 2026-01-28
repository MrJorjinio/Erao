using System.Net.Http.Json;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using Erao.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Erao.Infrastructure.Services;

public class OllamaService : IOllamaService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<OllamaService> _logger;
    private readonly string _model;
    private readonly string _baseUrl;

    public OllamaService(HttpClient httpClient, IConfiguration configuration, ILogger<OllamaService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _baseUrl = configuration["Ollama:BaseUrl"] ?? "http://localhost:11434";
        _model = configuration["Ollama:Model"] ?? "gpt-oss:120b-cloud";
        _httpClient.BaseAddress = new Uri(_baseUrl);
        _httpClient.Timeout = TimeSpan.FromMinutes(5);
    }

    public async Task<string> GenerateSqlFromNaturalLanguageAsync(string naturalLanguage, string schemaContext)
    {
        var systemPrompt = $@"You are an expert SQL query generator. Given a database schema and a natural language question, generate a valid SQL query.

Database Schema:
{schemaContext}

Rules:
1. Only generate SELECT queries unless explicitly asked for modifications
2. Use proper SQL syntax for the given database type
3. Include appropriate JOINs when needed
4. Use parameterized queries where applicable
5. Return ONLY the SQL query, no explanations

If the question cannot be answered with the given schema, respond with: ERROR: [explanation]";

        var (response, _) = await ChatAsync(naturalLanguage, Array.Empty<(string, string)>(), systemPrompt);
        return response;
    }

    public async Task<string> GenerateResponseAsync(string prompt, string? systemPrompt = null)
    {
        var (response, _) = await ChatAsync(prompt, Array.Empty<(string, string)>(), systemPrompt);
        return response;
    }

    public async Task<(string response, int tokensUsed)> ChatAsync(
        string userMessage,
        IEnumerable<(string role, string content)> history,
        string? schemaContext = null)
    {
        try
        {
            var messages = new List<object>();

            if (!string.IsNullOrEmpty(schemaContext))
            {
                messages.Add(new { role = "system", content = schemaContext });
            }

            // Add conversation history
            foreach (var (role, content) in history)
            {
                messages.Add(new { role, content });
            }

            messages.Add(new { role = "user", content = userMessage });

            var request = new
            {
                model = _model,
                messages,
                stream = false,
                options = new
                {
                    temperature = 0.1,    // Low temperature for strict instruction following
                    num_predict = 16384,  // Max response tokens (increased for large data)
                    num_ctx = 32768       // Context window size
                }
            };

            var response = await _httpClient.PostAsJsonAsync("/api/chat", request);
            response.EnsureSuccessStatusCode();

            var jsonResponse = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(jsonResponse);
            var root = doc.RootElement;

            var assistantMessage = root.GetProperty("message").GetProperty("content").GetString() ?? "";

            // Estimate tokens used (Ollama may provide this in different fields)
            var tokensUsed = 0;
            if (root.TryGetProperty("eval_count", out var evalCount))
            {
                tokensUsed = evalCount.GetInt32();
            }
            else if (root.TryGetProperty("prompt_eval_count", out var promptEvalCount))
            {
                tokensUsed = promptEvalCount.GetInt32();
                if (root.TryGetProperty("eval_count", out var responseEvalCount))
                {
                    tokensUsed += responseEvalCount.GetInt32();
                }
            }

            return (assistantMessage, tokensUsed);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error communicating with Ollama service");
            throw new InvalidOperationException("Failed to get response from AI service", ex);
        }
    }
}
