using System.ComponentModel.DataAnnotations;

namespace Eventuras.Services.Converto;

internal class ConvertoConfig
{
    [Required]
    public string PdfEndpointUrl { get; set; }

    [Required]
    public string ApiToken { get; set; }

    public float? DefaultScale { get; set; }

    public string DefaultFormat { get; set; }
}