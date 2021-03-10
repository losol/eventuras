using Eventuras.Services.Exceptions;
using Eventuras.Services.Registrations;
using Eventuras.WebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.WebApi.Controllers.Registrations
{
    [ApiVersion("3")]
    [Route("v{version:apiVersion}/registrations")]
    [ApiController]
    public class RegistrationsUpdateController : ControllerBase
    {
        private readonly IRegistrationRetrievalService _registrationRetrievalService;
        private readonly IRegistrationManagementService _registrationManagementService;

        public RegistrationsUpdateController(
            IRegistrationRetrievalService registrationRetrievalService,
            IRegistrationManagementService registrationManagementService)
        {
            _registrationRetrievalService = registrationRetrievalService ?? throw
                new ArgumentNullException(nameof(registrationRetrievalService));

            _registrationManagementService = registrationManagementService ?? throw
                new ArgumentNullException(nameof(registrationManagementService));
        }

        [HttpPost]
        public async Task<ActionResult<RegistrationDto>> CreateNewRegistration(
            [FromBody] NewRegistrationDto dto,
            CancellationToken cancellationToken)
        {
            try
            {
                var registration = await _registrationManagementService.CreateRegistrationAsync(dto.EventId, dto.UserId, dto.CopyTo, cancellationToken);
                return Ok(new RegistrationDto(registration));
            }
            catch (DuplicateException)
            {
                var registration = await _registrationRetrievalService.FindRegistrationAsync(new RegistrationFilter
                {
                    EventInfoId = dto.EventId,
                    UserId = dto.UserId
                }, null, cancellationToken);

                return Ok(new RegistrationDto(registration));
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<RegistrationDto>> UpdateRegistration(int id,
            [FromBody] RegistrationFormDto dto,
            CancellationToken cancellationToken)
        {
            var registration = await _registrationRetrievalService.GetRegistrationByIdAsync(id, null, cancellationToken);
            dto.CopyTo(registration);
            await _registrationManagementService.UpdateRegistrationAsync(registration, cancellationToken);
            return Ok(new RegistrationDto(registration));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelRegistration(int id, CancellationToken cancellationToken)
        {
            var registration = await _registrationRetrievalService.GetRegistrationByIdAsync(id, null, cancellationToken);
            registration.MarkAsCancelled();
            await _registrationManagementService.UpdateRegistrationAsync(registration, cancellationToken);
            return Ok();
        }
    }
}
