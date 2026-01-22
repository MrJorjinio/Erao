namespace Erao.Core.DTOs.Chat;

public class ConversationDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public Guid? DatabaseConnectionId { get; set; }
    public string? DatabaseConnectionName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<MessageDto> Messages { get; set; } = new();
}
