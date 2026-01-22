namespace Erao.Core.DTOs.Chat;

public class CreateConversationRequest
{
    public string Title { get; set; } = string.Empty;
    public Guid? DatabaseConnectionId { get; set; }
}
