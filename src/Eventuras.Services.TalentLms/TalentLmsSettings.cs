using System.ComponentModel.DataAnnotations;

namespace Eventuras.Services.TalentLms
{
    internal class TalentLmsSettings
    {
        [Required]
        public string SiteName { get; set; }

        [Required]
        public string ApiKey { get; set; }
    }
}
