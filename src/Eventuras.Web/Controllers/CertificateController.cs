using System;
using System.IO;
using System.Net.Mime;
using System.Threading.Tasks;
using Eventuras.Services.Certificates;
using Eventuras.Services.Events;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.Web.Controllers;

[Authorize(Policy = AuthPolicies.AdministratorRole)]
[Route("certificate")]
public class CertificateController : Controller
{
    private readonly ICertificateRetrievalService _certificateRetrievalService;
    private readonly IEventInfoRetrievalService _eventInfoRetrievalService;
    private readonly ICertificateRenderer _certificateRenderer;

    public CertificateController(
        ICertificateRetrievalService certificateRetrievalService,
        IEventInfoRetrievalService eventInfoRetrievalService,
        ICertificateRenderer certificateRenderer)
    {
        _certificateRetrievalService = certificateRetrievalService ?? throw new ArgumentNullException(nameof(certificateRetrievalService));

        _eventInfoRetrievalService = eventInfoRetrievalService ?? throw new ArgumentNullException(nameof(eventInfoRetrievalService));

        _certificateRenderer = certificateRenderer ?? throw new ArgumentNullException(nameof(certificateRenderer));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> View(int id)

    {
        var certificate = await _certificateRetrievalService.GetCertificateByIdAsync(id, CertificateRetrievalOptions.ForRendering);

        var html = await _certificateRenderer.RenderToHtmlAsStringAsync(new CertificateViewModel(certificate));

        return Content(html, MediaTypeNames.Text.Html);
    }

    [HttpGet("preview/event/{id}")]
    public async Task<IActionResult> ViewCertificateForEvent(int id)
    {
        var eventInfo = await _eventInfoRetrievalService.GetEventInfoByIdAsync(id, EventInfoRetrievalOptions.ForCertificateRendering);

        var html = await _certificateRenderer.RenderToHtmlAsStringAsync(new CertificateViewModel(eventInfo));

        return Content(html, MediaTypeNames.Text.Html);
    }

    [HttpGet("{id}/download")]
    public async Task<IActionResult> DownloadCertificate(int id)
    {
        var certificate = await _certificateRetrievalService.GetCertificateByIdAsync(id, CertificateRetrievalOptions.ForRendering);

        var stream = await _certificateRenderer.RenderToPdfAsStreamAsync(new CertificateViewModel(certificate));

        var memoryStream = new MemoryStream();
        await stream.CopyToAsync(memoryStream);
        return File(memoryStream.ToArray(), "application/pdf");
    }
}