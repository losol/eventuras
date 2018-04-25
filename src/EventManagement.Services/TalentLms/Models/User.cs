using Newtonsoft.Json;

namespace losol.EventManagement.Services.TalentLms.Models
{
    public class User
    {
        [JsonProperty("id")]
        public int? Id { get; set; }
        [JsonProperty("first_name")]
        public string FirstName { get; set; }
        [JsonProperty("last_name")]
        public string LastName { get; set; }
        [JsonProperty("email")]
        public string Email { get; set; }
        [JsonProperty("login")]
        public string Login { get; set; }

    }
}
