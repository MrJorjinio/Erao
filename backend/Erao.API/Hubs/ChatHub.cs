using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Erao.Application.Services;
using Erao.Core.DTOs.Chat;
using System.Security.Claims;

namespace Erao.API.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly IChatService _chatService;
    private readonly ILogger<ChatHub> _logger;

    public ChatHub(IChatService chatService, ILogger<ChatHub> logger)
    {
        _chatService = chatService;
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
