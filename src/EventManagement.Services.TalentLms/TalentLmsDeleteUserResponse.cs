using Newtonsoft.Json;

namespace EventManagement.Services.TalentLms
{
    internal class TalentLmsDeleteUserResponse
    {
        [JsonProperty("message")]
        public string Message { get; set; }
    }
}
