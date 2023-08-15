using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Services.Certificates;
using Eventuras.Services.Events;
using Eventuras.Services.Registrations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.Web.Controllers.Api.V0;

[ApiVersion("0")]
[Authorize(Policy = AuthPolicies.AdministratorRole)]
[Route("api/certificates")]
public class CertificatesController : Controller
{
    private readonly IEventInfoRetrievalService _eventInfoRetrievalService;
    private readonly ICertificateIssuingService _certificateIssuingService;
    private readonly ICertificateDeliveryService _certificateDeliveryService;

    public CertificatesController(
        ICertificateIssuingService certificateIssuingService,
        ICertificateDeliveryService certificateDeliveryService,
        IEventInfoRetrievalService eventInfoRetrievalService)
    {
        _certificateIssuingService = certificateIssuingService;
        _certificateDeliveryService = certificateDeliveryService;
        _eventInfoRetrievalService = eventInfoRetrievalService;
    }

    [HttpPost("event/{eventId}/email")]
    public async Task<IActionResult> GenerateCertificatesAndSendEmails(int eventId, CancellationToken cancellationToken)
    {
        var eventInfo = await _eventInfoRetrievalService.GetEventInfoByIdAsync(eventId, cancellationToken);

        var certificates = await _certificateIssuingService.CreateCertificatesForEventAsync(eventInfo, cancellationToken);

        foreach (var certificate in certificates.TakeWhile(_ => !cancellationToken.IsCancellationRequested))
            await _certificateDeliveryService.SendCertificateAsync(certificate, cancellationToken);

        return Ok();
    }

    [HttpPost("event/{eventId}/update")]
    public async Task<IActionResult> UpdateCertificatesForEvent([FromRoute] int eventId)
    {
        var eventInfo = await _eventInfoRetrievalService.GetEventInfoByIdAsync(eventId);

        var result = await _certificateIssuingService.UpdateCertificatesForEventAsync(eventInfo);
        return Ok($"Oppdaterte {result.Count()}");
    }

    [HttpPost("registration/{regId}/email")]
    public async Task<IActionResult> EmailCertificate(
        [FromRoute] int regId,
        [FromServices] IRegistrationRetrievalService registrationRetrievalService)
    {
        var reg = await registrationRetrievalService.GetRegistrationByIdAsync(regId, RegistrationRetrievalOptions.ForCertificateRendering);

        if (reg.Certificate == null) return NotFound($"Registration {regId} doesn't have certificate");

        await _certificateDeliveryService.SendCertificateAsync(reg.Certificate);
        return Ok();
    }
}