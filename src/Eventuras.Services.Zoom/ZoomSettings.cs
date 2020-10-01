using System.ComponentModel.DataAnnotations;

namespace Eventuras.Services.Zoom
{
    internal class ZoomSettings
    {
        [Required]
        public ZoomJwtCredentials[] Apps { get; set; }
    }

    internal class ZoomJwtCredentials
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public string ApiKey { get; set; }

        [Required]
        public string ApiSecret { get; set; }
    }
}
