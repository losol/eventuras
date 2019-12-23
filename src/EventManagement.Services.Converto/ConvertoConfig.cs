using System.ComponentModel.DataAnnotations;

namespace EventManagement.Services.Converto
{
    public class ConvertoConfig
    {
        [Required]
        public string EndpointUrl { get; set; }

        public float? DefaultScale { get; set; }

        public string DefaultFormat { get; set; }
    }
}
