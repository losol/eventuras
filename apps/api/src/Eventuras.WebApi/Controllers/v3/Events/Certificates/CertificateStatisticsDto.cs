using Newtonsoft.Json;

namespace Eventuras.WebApi.Controllers.v3.Events.Certificates;

public class CertificateStatisticsDto
{
    [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
    public int? Issued { get; set; }

    [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
    public int? Updated { get; set; }
}
