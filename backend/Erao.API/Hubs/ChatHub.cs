using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Erao.Application.Services;
using Erao.Core.DTOs.Chat;
using Erao.Core.Interfaces;
using System.Security.Claims;
using System.Text;

namespace Erao.API.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly IChatService _chatService;
    private readonly IOllamaService _ollamaService;
    private readonly ILogger<ChatHub> _logger;

    public ChatHub(IChatService chatService, IOllamaService ollamaService, ILogger<ChatHub> logger)
    {
        _chatService = chatService;
        _ollamaService = ollamaService;
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = GetUserId();
        if (userId.HasValue)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, userId.Value.ToString());
            _logger.LogInformation("User {UserId} connected to chat hub", userId.Value);
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = GetUserId();
        if (userId.HasValue)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId.Value.ToString());
            _logger.LogInformation("User {UserId} disconnected from chat hub", userId.Value);
        }
        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinConversation(Guid conversationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"conversation-{conversationId}");
        _logger.LogInformation("Connection {ConnectionId} joined conversation {ConversationId}",
            Context.ConnectionId, conversationId);
    }

    public async Task LeaveConversation(Guid conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"conversation-{conversationId}");
        _logger.LogInformation("Connection {ConnectionId} left conversation {ConversationId}",
            Context.ConnectionId, conversationId);
    }

    /// <summary>
    /// Send message with streaming response - chunks are sent in real-time
    /// </summary>
    public async Task SendMessageStreaming(ChatRequest request)
    {
        var userId = GetUserId();
        if (!userId.HasValue)
        {
            await Clients.Caller.SendAsync("Error", "Unauthorized");
            return;
        }

        var conversationGroup = $"conversation-{request.ConversationId}";

        try
        {
            // Notify that AI is processing
            await Clients.Group(conversationGroup).SendAsync("StreamStarted", new
            {
                ConversationId = request.ConversationId
            });

            // Prepare streaming context (validates user, saves user message, gets schema)
            var context = await _chatService.PrepareStreamingChatAsync(userId.Value, request);

            // Send user message confirmation
            await Clients.Group(conversationGroup).SendAsync("UserMessageSaved", new
            {
                MessageId = context.UserMessage.Id,
                Content = context.UserMessage.Content,
                CreatedAt = context.UserMessage.CreatedAt
            });

            // Stream AI response chunks
            var fullResponse = new StringBuilder();
            var chunkIndex = 0;

            await foreach (var chunk in _ollamaService.ChatStreamAsync(
                request.Message,
                context.History,
                context.SystemPrompt))
            {
                fullResponse.Append(chunk);
                chunkIndex++;

                // Send chunk to client
                await Clients.Group(conversationGroup).SendAsync("StreamChunk", new
                {
                    ConversationId = request.ConversationId,
                    Chunk = chunk,
                    Index = chunkIndex
                });
            }

            // Notify that we're now running the query
            await Clients.Group(conversationGroup).SendAsync("QueryExecuting", new
            {
                ConversationId = request.ConversationId
            });

            // Finalize - extract SQL, execute query, save assistant message
            var response = await _chatService.FinalizeStreamingChatAsync(context, fullResponse.ToString());

            // Send completion with final data (query result, cleaned content)
            await Clients.Group(conversationGroup).SendAsync("StreamCompleted", new
            {
                ConversationId = request.ConversationId,
                AssistantMessage = response.AssistantMessage,
                QueryResult = response.QueryResult,
                TokensUsed = response.TokensUsed
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Chat operation failed: {Message}", ex.Message);
            await Clients.Caller.SendAsync("Error", ex.Message);
            await Clients.Group(conversationGroup).SendAsync("StreamError", new
            {
                ConversationId = request.ConversationId,
                Error = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing streaming message in SignalR hub");
            await Clients.Caller.SendAsync("Error", "An error occurred while processing your message");
            await Clients.Group(conversationGroup).SendAsync("StreamError", new
            {
                ConversationId = request.ConversationId,
                Error = "An error occurred while processing your message"
            });
        }
    }

    /// <summary>
    /// Send message without streaming (legacy method)
    /// </summary>
    public async Task SendMessage(ChatRequest request)
    {
        var userId = GetUserId();
        if (!userId.HasValue)
        {
            await Clients.Caller.SendAsync("Error", "Unauthorized");
            return;
        }

        try
        {
            // Notify that AI is processing
            await Clients.Group($"conversation-{request.ConversationId}")
                .SendAsync("TypingStarted", new { ConversationId = request.ConversationId });

            var response = await _chatService.ProcessMessageAsync(userId.Value, request);

            // Send the response to all clients in the conversation
            await Clients.Group($"conversation-{request.ConversationId}")
                .SendAsync("MessageReceived", response);

            // Notify that AI has finished
            await Clients.Group($"conversation-{request.ConversationId}")
                .SendAsync("TypingStopped", new { ConversationId = request.ConversationId });
        }
        catch (InvalidOperationException ex)
        {
            await Clients.Caller.SendAsync("Error", ex.Message);
            await Clients.Group($"conversation-{request.ConversationId}")
                .SendAsync("TypingStopped", new { ConversationId = request.ConversationId });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing message in SignalR hub");
            await Clients.Caller.SendAsync("Error", "An error occurred while processing your message");
            await Clients.Group($"conversation-{request.ConversationId}")
                .SendAsync("TypingStopped", new { ConversationId = request.ConversationId });
        }
    }

    public async Task NotifyTyping(Guid conversationId)
    {
        var userId = GetUserId();
        if (userId.HasValue)
        {
            await Clients.OthersInGroup($"conversation-{conversationId}")
                .SendAsync("UserTyping", new { UserId = userId.Value, ConversationId = conversationId });
        }
    }

    private Guid? GetUserId()
    {
        var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return null;
        }
        return userId;
    }
}
