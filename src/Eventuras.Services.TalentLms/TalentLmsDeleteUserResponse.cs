using Newtonsoft.Json;

namespace Eventuras.Services.TalentLms;

internal class TalentLmsDeleteUserResponse
{
    [JsonProperty("message")]
    public string Message { get; set; }
}