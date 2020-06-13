using System.ComponentModel.DataAnnotations;

namespace Eventuras.Services.Converto
{
    internal class ConvertoConfig
    {
        [Required]
        public string LoginEndpointUrl { get; set; }

        [Required]
        public string Html2PdfEndpointUrl { get; set; }

        [Required]
        public string Username { get; set; }

        [Required]
        public string Password { get; set; }

        public float? DefaultScale { get; set; }

        public string DefaultFormat { get; set; }
    }
}
