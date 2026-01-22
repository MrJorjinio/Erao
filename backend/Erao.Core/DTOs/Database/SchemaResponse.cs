namespace Erao.Core.DTOs.Database;

public class SchemaResponse
{
    public string Schema { get; set; } = string.Empty;
    public DateTime? CachedAt { get; set; }
}
