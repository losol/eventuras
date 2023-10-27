using Asp.Versioning;
using Eventuras.Domain;
using Eventuras.Services.Certificates;
using Eventuras.Services.Events;
using Eventuras.WebApi.Controllers.Certificates;
using Eventuras.WebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Net.Mime;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.WebApi.Controllers.Events.Certificates
{
    [ApiController]
    [ApiVersion("3")]
    [Route("v{version:apiVersion}/event/{id}/certificates")]
    [Authorize(Policy = Constants.Auth.AdministratorRole)]
    public class EventCertificatesController : ControllerBase
    {
        private readonly IEventInfoAccessControlService _eventInfoAccessControlService;
        private readonly IEventInfoRetrievalService _eventInfoRetrievalService;
        private readonly ICertificateRenderer _certificateRenderer;
        private readonly ICertificateIssuingService _certificateIssuingService;
        private readonly ICertificateDeliveryService _certificateDeliveryService;
        private readonly ICertificateRetrievalService _certificateRetrievalService;

        public EventCertificatesController(
            IEventInfoRetrievalService eventInfoRetrievalService,
            ICertificateRenderer certificateRenderer,
            ICertificateIssuingService certificateIssuingService,
            ICertificateDeliveryService certificateDeliveryService,
            IEventInfoAccessControlService eventInfoAccessControlService,
            ICertificateRetrievalService certificateRetrievalService)
        {
            _eventInfoRetrievalService = eventInfoRetrievalService ?? throw
                new ArgumentNullException(nameof(eventInfoRetrievalService));

            _certificateRenderer = certificateRenderer ?? throw
                new ArgumentNullException(nameof(certificateRenderer));

            _certificateIssuingService = certificateIssuingService ?? throw
                new ArgumentNullException(nameof(certificateIssuingService));

            _certificateDeliveryService = certificateDeliveryService ?? throw
                new ArgumentNullException(nameof(certificateDeliveryService));

            _eventInfoAccessControlService = eventInfoAccessControlService ?? throw
                new ArgumentNullException(nameof(eventInfoAccessControlService));

            _certificateRetrievalService = certificateRetrievalService ?? throw
                new ArgumentNullException(nameof(certificateRetrievalService));
        }

        [HttpGet]
        public async Task<IActionResult> List(int id,
            [FromQuery] EventCertificateQueryDto query,
            CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState.FormatErrors());
            }

            var eventInfo = await _eventInfoRetrievalService.GetEventInfoByIdAsync(id, cancellationToken);
            await _eventInfoAccessControlService.CheckEventManageAccessAsync(eventInfo, cancellationToken);

            var certificates = await _certificateRetrievalService
                .ListCertificatesAsync(new CertificateListRequest
                {
                    Limit = query.Limit,
                    Offset = query.Offset,
                    Filter = new CertificateFilter
                    {
                        EventId = id
                    }
                }, new CertificateRetrievalOptions
                {
                    LoadIssuingOrganization = true,
                    LoadIssuingUser = true,
                    LoadRecipientUser = true
                }, cancellationToken);

            return Ok(PageResponseDto<EventDto>.FromPaging(
                query, certificates,
                c => new CertificateDto(c)));
        }

        [HttpGet("preview")]
        public async Task<IActionResult> Preview(int id, CancellationToken cancellationToken)
        {
            var eventInfo =
                await GetEventByIdAsync(id,
                    EventInfoRetrievalOptions.ForCertificateRendering,
                    cancellationToken);

            var html = await _certificateRenderer
                .RenderToHtmlAsStringAsync(new CertificateViewModel(eventInfo));

            return Content(html, MediaTypeNames.Text.Html);
        }

        [HttpPost("issue")]
        public async Task<IActionResult> Issue(int id,
            [FromQuery] bool send = true,
            CancellationToken cancellationToken = default)
        {
            var eventInfo = await _eventInfoRetrievalService
                .GetEventInfoByIdAsync(id, cancellationToken);

            var certificates = await _certificateIssuingService
                .CreateCertificatesForEventAsync(eventInfo, cancellationToken);

            if (send)
            {
                foreach (var certificate in certificates
                    .TakeWhile(_ => !cancellationToken.IsCancellationRequested))
                {
                    await _certificateDeliveryService.SendCertificateAsync(certificate, cancellationToken);
                }
            }

            return Ok(new CertificateStatisticsDto
            {
                Issued = certificates.Count
            });
        }

        [HttpPost("update")]
        public async Task<IActionResult> Update(int id, CancellationToken cancellationToken)
        {
            var eventInfo = await GetEventByIdAsync(id, cancellationToken: cancellationToken);

            var certificates = await _certificateIssuingService
                .UpdateCertificatesForEventAsync(eventInfo, cancellationToken);

            return Ok(new CertificateStatisticsDto
            {
                Updated = certificates.Count
            });
        }

        private async Task<EventInfo> GetEventByIdAsync(
            int id,
            EventInfoRetrievalOptions options = default,
            CancellationToken cancellationToken = default)
        {
            var eventInfo = await _eventInfoRetrievalService
                .GetEventInfoByIdAsync(id, options, cancellationToken);

            await _eventInfoAccessControlService
                .CheckEventManageAccessAsync(eventInfo, cancellationToken);

            return eventInfo;
        }
    }
}
