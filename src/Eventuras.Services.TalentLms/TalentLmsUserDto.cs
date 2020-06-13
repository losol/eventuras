using Newtonsoft.Json;

namespace Eventuras.Services.TalentLms
{
    internal class TalentLmsUserDto
    {
        [JsonProperty("id")]
        public string Id { get; set; }
        [JsonProperty("login")]
        public string Login { get; set; }
        [JsonProperty("first_name")]
        public string FirstName { get; set; }
        [JsonProperty("last_name")]
        public string LastName { get; set; }
        [JsonProperty("email")]
        public string Email { get; set; }
        [JsonProperty("restrict_email")]
        public string RestrictEmail { get; set; }
        [JsonProperty("user_type")]
        public string UserYype { get; set; }
        [JsonProperty("timezone")]
        public string Timezone { get; set; }
        [JsonProperty("language")]
        public string Language { get; set; }
        [JsonProperty("status")]
        public string Status { get; set; }
        [JsonProperty("level")]
        public string Level { get; set; }
        [JsonProperty("points")]
        public string Points { get; set; }
        [JsonProperty("created_on")]
        public string CreatedOn { get; set; }
        [JsonProperty("last_updated")]
        public string LastUpdated { get; set; }
        [JsonProperty("last_updated_timestamp")]
        public string LastUpdatedTimestamp { get; set; }
        [JsonProperty("avatar")]
        public string Avatar { get; set; }
        [JsonProperty("bio")]
        public string Bio { get; set; }
        [JsonProperty("login_key")]
        public string LoginKey { get; set; }
    }
}