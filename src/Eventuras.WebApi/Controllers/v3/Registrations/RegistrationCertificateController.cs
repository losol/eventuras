using Asp.Versioning;
using Eventuras.Services.Certificates;
using Eventuras.Services.Registrations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.WebApi.Controllers.Registrations
{
    [Authorize]
    [ApiController]
    [ApiVersion("3")]
    [Route("v{version:apiVersion}/registrations/{id}/certificate")]
    public class RegistrationCertificateController : ControllerBase
    {
        private readonly IRegistrationRetrievalService _registrationRetrievalService;
        private readonly ICertificateDeliveryService _certificateDeliveryService;

        public RegistrationCertificateController(
            IRegistrationRetrievalService registrationRetrievalService,
            ICertificateDeliveryService certificateDeliveryService)
        {
            _registrationRetrievalService = registrationRetrievalService ?? throw
                new ArgumentNullException(nameof(registrationRetrievalService));

            _certificateDeliveryService = certificateDeliveryService ?? throw
                new ArgumentNullException(nameof(certificateDeliveryService));
        }

        [HttpPost("send")]
        public async Task<IActionResult> Send(int id, CancellationToken cancellationToken)
        {
            var reg = await _registrationRetrievalService.GetRegistrationByIdAsync(id,
                RegistrationRetrievalOptions.ForCertificateRendering,
                cancellationToken);

            if (reg.Certificate == null)
            {
                return NotFound($"Registration {id} doesn't have certificate issued");
            }

            await _certificateDeliveryService
                .SendCertificateAsync(reg.Certificate, cancellationToken);

            return Ok();
        }
    }
}
