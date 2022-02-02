using System;
using System.IO;
using System.Net.Mime;
using System.Threading.Tasks;
using Eventuras.Services.Certificates;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;

namespace Eventuras.WebApi.Controllers.Certificates
{
    [Authorize]
    [ApiController]
    [ApiVersion("3")]
    [Route("v{version:apiVersion}/certificates")]
    public class CertificatesController : ControllerBase
    {
        private readonly ICertificateRetrievalService _certificateRetrievalService;
        private readonly ICertificateRenderer _certificateRenderer;

        public CertificatesController(
            ICertificateRetrievalService certificateRetrievalService,
            ICertificateRenderer certificateRenderer)
        {
            _certificateRetrievalService = certificateRetrievalService ?? throw
                new ArgumentNullException(nameof(certificateRetrievalService));

            _certificateRenderer = certificateRenderer ?? throw
                new ArgumentNullException(nameof(certificateRenderer));
        }

        [HttpGet("{id}")]
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
                    var stream = await _certificateRenderer
                        .RenderToPdfAsStreamAsync(new CertificateViewModel(cert));

                    var memoryStream = new MemoryStream();
                    await stream.CopyToAsync(memoryStream);
                    return File(memoryStream.ToArray(), MediaTypeNames.Application.Pdf);

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
}
