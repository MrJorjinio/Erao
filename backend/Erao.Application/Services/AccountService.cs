using AutoMapper;
using Erao.Core.DTOs;
using Erao.Core.Interfaces;

namespace Erao.Application.Services;

public interface IAccountService
{
    Task<UserDto?> GetAccountAsync(Guid userId);
    Task<UserDto> UpdateAccountAsync(Guid userId, string? firstName, string? lastName);
    Task DeleteAccountAsync(Guid userId);
}

public class AccountService : IAccountService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public AccountService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<UserDto?> GetAccountAsync(Guid userId)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null)
        {
            return null;
        }
        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> UpdateAccountAsync(Guid userId, string? firstName, string? lastName)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        if (!string.IsNullOrEmpty(firstName))
            user.FirstName = firstName;
        if (!string.IsNullOrEmpty(lastName))
            user.LastName = lastName;

        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<UserDto>(user);
    }

    public async Task DeleteAccountAsync(Guid userId)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        // Delete all user's data
        // Delete conversations and messages
        var conversations = await _unitOfWork.Conversations.GetByUserIdAsync(userId);
        foreach (var conversation in conversations)
        {
            await _unitOfWork.Conversations.DeleteAsync(conversation);
        }

        // Delete database connections
        var connections = await _unitOfWork.DatabaseConnections.GetByUserIdAsync(userId);
        foreach (var connection in connections)
        {
            await _unitOfWork.DatabaseConnections.DeleteAsync(connection);
        }

        // Delete the user
        await _unitOfWork.Users.DeleteAsync(user);
        await _unitOfWork.SaveChangesAsync();
    }
}
