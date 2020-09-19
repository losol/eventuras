using System.ComponentModel.DataAnnotations;

namespace Eventuras.Services.Zoom
{
    internal class ZoomSettings
    {
        [Required]
        public string ApiKey { get; set; }

        [Required]
        public string ApiSecret { get; set; }
    }
}
