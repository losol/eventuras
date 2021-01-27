using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Eventuras.WebApi.Controllers.UserProfile
{
    public class UserInfo
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("claims")]
        public Dictionary<string, string> Claims { get; set; }
    }
}
