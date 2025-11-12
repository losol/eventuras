using System;
using System.IO;
using System.Net.Mime;
using System.Security.Authentication;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Services.Certificates;
using Eventuras.Services.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Net.Http.Headers;

namespace Eventuras.WebApi.Controllers.v3.Certificates;

[Authorize]
[ApiController]
[ApiVersion("3")]
[Route("v{version:apiVersion}/certificates")]
public class CertificatesController : ControllerBase
{
    private readonly ICertificateRenderer _certificateRenderer;
    private readonly ICertificateRetrievalService _certificateRetrievalService;
    private readonly ILogger<CertificatesController> _logger;

    public CertificatesController(
        ICertificateRetrievalService certificateRetrievalService,
        ICertificateRenderer certificateRenderer,
        ILogger<CertificatesController> logger)
    {
        _certificateRetrievalService = certificateRetrievalService ??
                                       throw new ArgumentNullException(nameof(certificateRetrievalService));
        _certificateRenderer = certificateRenderer ?? throw new ArgumentNullException(nameof(certificateRenderer));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(CertificateDto), StatusCodes.Status200OK, Type = typeof(CertificateDto))]
    public async Task<IActionResult> Get(int id, [FromQuery] CertificateFormat? format = null)
    {
        var cert = await _certificateRetrievalService
            .GetCertificateByIdAsync(id, CertificateRetrievalOptions.ForRendering);

        format ??= GetCertificateFormatFromMediaType(Request.Headers[HeaderNames.Accept])
                   ?? CertificateFormat.Json;

        switch (format)
        {
            case CertificateFormat.Json:
                return Ok(new CertificateDto(cert));

            case CertificateFormat.Html:
                var html = await _certificateRenderer
                    .RenderToHtmlAsStringAsync(new CertificateViewModel(cert));
                return Content(html, MediaTypeNames.Text.Html);

            case CertificateFormat.Pdf:
                try
                {
                    var stream = await _certificateRenderer.RenderToPdfAsStreamAsync(new CertificateViewModel(cert));
                    var memoryStream = new MemoryStream();
                    await stream.CopyToAsync(memoryStream);
                    return File(memoryStream.ToArray(), MediaTypeNames.Application.Pdf);
                }
                catch (ServiceException ex)
                {
                    if (ex.InnerException is AuthenticationException)
                    {
                        _logger.LogError(ex, "Error generating PDF for certificate.");
                        return StatusCode(StatusCodes.Status503ServiceUnavailable,
                            "Pdf generator service authentication failed.");
                    }

                    _logger.LogError(ex, "Error generating PDF for certificate.");
                    return StatusCode(StatusCodes.Status500InternalServerError,
                        "An error occurred while generating the PDF.");
                }

            default:
                throw new InvalidOperationException($"Unsupported cert format: {format}");
        }
    }

    private static CertificateFormat? GetCertificateFormatFromMediaType(params string[] mediaTypes)
    {
        foreach (var mediaType in mediaTypes)
        {
            if (MediaTypeNames.Text.Html.ToLower().Equals(mediaType))
            {
                return CertificateFormat.Html;
            }

            if (MediaTypeNames.Application.Pdf.ToLower().Equals(mediaType))
            {
                return CertificateFormat.Pdf;
            }

            if (MediaTypeNames.Application.Json.ToLower().Equals(mediaType))
            {
                return CertificateFormat.Json;
            }
        }

        return null;
    }
}
