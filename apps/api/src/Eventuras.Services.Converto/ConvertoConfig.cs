using System.ComponentModel.DataAnnotations;
using Eventuras.Domain;

namespace Eventuras.Services.Converto;

internal class ConvertoConfig
{
    [Required] public string PdfEndpointUrl { get; set; }

    [Required] public string TokenEndpointUrl { get; set; }

    [Required] public string ClientId { get; set; }

    [Required] public string ClientSecret { get; set; }

    [Range(0.2, 2.0)] public float? DefaultScale { get; set; } = 1.0f;

    public PaperSize DefaultPaperSize { get; set; } = PaperSize.A4;
}
