using System.Text.Json.Serialization;

namespace Eventuras.WebApi.Controllers.v3.Events.Certificates;

public class CertificateStatisticsDto
{
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public int? Issued { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public int? Updated { get; set; }
}
