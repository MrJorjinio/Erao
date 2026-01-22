using AutoMapper;
using Erao.Core.DTOs.Chat;
using Erao.Core.Entities;
using Erao.Core.Interfaces;

namespace Erao.Application.Services;

public interface IConversationService
{
    Task<IEnumerable<ConversationDto>> GetUserConversationsAsync(Guid userId);
    Task<ConversationDto?> GetByIdAsync(Guid id, Guid userId);
    Task<ConversationDto> CreateAsync(Guid userId, CreateConversationRequest request);
    Task DeleteAsync(Guid id, Guid userId);
}

public class ConversationService : IConversationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ConversationService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ConversationDto>> GetUserConversationsAsync(Guid userId)
    {
        var conversations = await _unitOfWork.Conversations.GetByUserIdAsync(userId);
        return _mapper.Map<IEnumerable<ConversationDto>>(conversations);
    }

    public async Task<ConversationDto?> GetByIdAsync(Guid id, Guid userId)
    {
        var conversation = await _unitOfWork.Conversations.GetWithMessagesAsync(id);
        if (conversation == null || conversation.UserId != userId)
        {
            return null;
        }
        return _mapper.Map<ConversationDto>(conversation);
    }

    public async Task<ConversationDto> CreateAsync(Guid userId, CreateConversationRequest request)
    {
        // Validate database connection if provided
        if (request.DatabaseConnectionId.HasValue)
        {
            var dbConnection = await _unitOfWork.DatabaseConnections.GetByIdAsync(request.DatabaseConnectionId.Value);
            if (dbConnection == null || dbConnection.UserId != userId)
            {
                throw new InvalidOperationException("Database connection not found");
            }
        }

        var conversation = new Conversation
        {
            UserId = userId,
            Title = request.Title,
            DatabaseConnectionId = request.DatabaseConnectionId
        };

        await _unitOfWork.Conversations.AddAsync(conversation);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<ConversationDto>(conversation);
    }

    public async Task DeleteAsync(Guid id, Guid userId)
    {
        var conversation = await _unitOfWork.Conversations.GetByIdAsync(id);
        if (conversation == null || conversation.UserId != userId)
        {
            throw new InvalidOperationException("Conversation not found");
        }

        await _unitOfWork.Conversations.DeleteAsync(conversation);
        await _unitOfWork.SaveChangesAsync();
    }
}
