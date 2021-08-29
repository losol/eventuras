using System;
using System.ComponentModel.DataAnnotations;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Auth;
using Eventuras.Services.Registrations;
using Eventuras.WebApi.Controllers.Users;
using Eventuras.WebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.Registrations
{
    [ApiVersion("3")]
    [Authorize]
    [Route("v{version:apiVersion}/registrations")]
    [ApiController]
    public class RegistrationsController : ControllerBase
    {
        private readonly IRegistrationRetrievalService _registrationRetrievalService;
        private readonly IRegistrationManagementService _registrationManagementService;

        public RegistrationsController(
            IRegistrationRetrievalService registrationRetrievalService,
            IRegistrationManagementService registrationManagementService)
        {
            _registrationRetrievalService = registrationRetrievalService ?? throw
                new ArgumentNullException(nameof(registrationRetrievalService));

            _registrationManagementService = registrationManagementService ?? throw
                new ArgumentNullException(nameof(registrationManagementService));
        }

        [HttpGet]
        public async Task<PageResponseDto<RegistrationDto>> GetRegistrations(
            [FromQuery] RegistrationsQueryDto query,
            CancellationToken cancellationToken)
        {
            var paging = await _registrationRetrievalService
                .ListRegistrationsAsync(
                    new RegistrationListRequest
                    {
                        Limit = query.Limit,
                        Offset = query.Offset,
                        Filter = new RegistrationFilter
                        {
                            AccessibleOnly = true,
                            EventInfoId = query.EventId ?? null
                        },
                        OrderBy = RegistrationListOrder.RegistrationTime,
                        Descending = true
                    },
                    RetrievalOptions(query),
                    cancellationToken);

            return PageResponseDto<RegistrationDto>.FromPaging(
                query, paging, r => new RegistrationDto(r));
        }

        // GET: v3/registrations/5
        [HttpGet("{id}")]
        public async Task<ActionResult<RegistrationDto>> GetRegistrationById(int id,
            [FromQuery] RegistrationsQueryDto query, CancellationToken cancellationToken)
        {
            var registration =
                await _registrationRetrievalService.GetRegistrationByIdAsync(id, RetrievalOptions(query),
                    cancellationToken);

            return Ok(new RegistrationDto(registration));
        }

        [HttpPost]
        public async Task<ActionResult<RegistrationDto>> CreateNewRegistration(
            [FromBody] NewRegistrationDto dto,
            CancellationToken cancellationToken)
        {
            var registration =
                await _registrationManagementService.CreateRegistrationAsync(dto.EventId, dto.UserId,
                    new RegistrationOptions
                    {
                        CreateOrder = dto.CreateOrder
                    },
                    cancellationToken);

            if (!dto.Empty)
            {
                dto.CopyTo(registration);
                await _registrationManagementService
                    .UpdateRegistrationAsync(registration, cancellationToken);
            }

            return Ok(new RegistrationDto(registration));
        }

        /// <summary>
        /// Alias for POST /v3/registrations
        /// </summary>
        [HttpPost("me/{eventId}")]
        public async Task<ActionResult<RegistrationDto>> RegisterSelf(
            int eventId, [FromQuery(Name = "createOrder")] bool createOrder)
        {
            var registration = await _registrationManagementService
                .CreateRegistrationAsync(eventId, User.GetUserId(), new RegistrationOptions
                {
                    CreateOrder = createOrder
                });

            return Ok(new RegistrationDto(registration));
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<RegistrationDto>> UpdateRegistration(int id,
            [FromBody] RegistrationFormDto dto,
            CancellationToken cancellationToken)
        {
            var registration = await _registrationRetrievalService
                .GetRegistrationByIdAsync(id, null, cancellationToken);

            dto.CopyTo(registration);

            await _registrationManagementService.UpdateRegistrationAsync(registration, cancellationToken);
            return Ok(new RegistrationDto(registration));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelRegistration(int id, CancellationToken cancellationToken)
        {
            var registration = await _registrationRetrievalService
                .GetRegistrationByIdAsync(id, null, cancellationToken);

            registration.MarkAsCancelled();

            await _registrationManagementService.UpdateRegistrationAsync(registration, cancellationToken);
            return Ok();
        }

        private static RegistrationRetrievalOptions RetrievalOptions(RegistrationsQueryDto query)
        {
            return new()
            {
                IncludeUser = query.IncludeUserInfo,
                IncludeEventInfo = query.IncludeEventInfo,
                IncludeProducts = query.IncludeProducts,
                IncludeOrders = query.IncludeOrders
            };
        }
    }

    public class NewRegistrationDto : RegistrationFormDto
    {
        [Required] public string UserId { get; set; }

        [Required] [Range(1, int.MaxValue)] public int EventId { get; set; }

        [FromQuery(Name = "createOrder")] public bool CreateOrder { get; set; }
    }

    public class RegistrationDto
    {
        public int RegistrationId { get; set; }
        public int EventId { get; set; }
        public string UserId { get; set; }
        public Registration.RegistrationStatus Status { get; set; }
        public Registration.RegistrationType Type { get; set; }
        public int? CertificateId { get; set; }
        public string Notes { get; set; }
        public UserDto User { get; set; }
        public EventDto Event { get; set; }

        public RegistrationDto(Registration registration)
        {
            RegistrationId = registration.RegistrationId;
            EventId = registration.EventInfoId;
            UserId = registration.UserId;
            Status = registration.Status;
            Type = registration.Type;
            Notes = registration.Notes;
            if (registration.User != null)
            {
                User = new UserDto(registration.User);
            }

            if (registration.EventInfo != null)
            {
                Event = new EventDto(registration.EventInfo);
            }
        }
    }
}
