using Asp.Versioning;
using Eventuras.Services.Auth;
using Eventuras.Services.Registrations;
using Eventuras.WebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

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

        private readonly ILogger<RegistrationsController> _logger;

        public RegistrationsController(
            IRegistrationRetrievalService registrationRetrievalService,
            IRegistrationManagementService registrationManagementService,
            ILogger<RegistrationsController> logger)
        {
            _registrationRetrievalService = registrationRetrievalService ?? throw
                new ArgumentNullException(nameof(registrationRetrievalService));

            _registrationManagementService = registrationManagementService ?? throw
                new ArgumentNullException(nameof(registrationManagementService));

            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }


        [HttpGet]
        public async Task<PageResponseDto<RegistrationDto>> GetRegistrations(
      [FromQuery] RegistrationsQueryDto query,
      CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("GetRegistrations called with invalid query parameters: {query}", query);
                throw new BadHttpRequestException("Invalid query parameters.");
            }
            _logger.LogInformation("GetRegistrations called with query: {query}", query);

            var paging = await _registrationRetrievalService
                .ListRegistrationsAsync(
                    new RegistrationListRequest
                    {
                        Limit = query.Limit,
                        Offset = query.Offset,
                        Filter = new RegistrationFilter
                        {
                            AccessibleOnly = true,
                            EventInfoId = query.EventId,
                            UserId = query.UserId
                        },
                        OrderBy = RegistrationListOrder.RegistrationTime,
                        Descending = true
                    },
                    RetrievalOptions(query),
                    cancellationToken);

            return PageResponseDto<RegistrationDto>.FromPaging(
                query, paging, r => new RegistrationDto(r));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RegistrationDto>> GetRegistrationById(int id,
        [FromQuery] RegistrationsQueryDto query, CancellationToken cancellationToken)
        {
            _logger.LogInformation("GetRegistrationById called with ID: {id}, and query: {query}", id, query);

            var registration = await _registrationRetrievalService.GetRegistrationByIdAsync(id, RetrievalOptions(query), cancellationToken);
            if (registration == null)
            {
                return NotFound("Registration not found.");
            }

            return new RegistrationDto(registration);

        }



        [HttpPost]
        public async Task<ActionResult<RegistrationDto>> CreateNewRegistration(
          [FromBody] NewRegistrationDto dto,
          CancellationToken cancellationToken)
        {
            _logger.LogInformation("CreateNewRegistration called with EventId: {eventId}, UserId: {userId}, CreateOrder: {createOrder}", dto.EventId, dto.UserId, dto.CreateOrder);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var registration = await _registrationManagementService.CreateRegistrationAsync(dto.EventId, dto.UserId, new RegistrationOptions
            {
                CreateOrder = dto.CreateOrder
            }, cancellationToken);

            if (!dto.Empty)
            {
                dto.CopyTo(registration);
                await _registrationManagementService.UpdateRegistrationAsync(registration, cancellationToken);
            }

            return new RegistrationDto(registration);
        }


        /// <summary>
        /// Alias for POST /v3/registrations
        /// </summary>
        [HttpPost("me/{eventId}")]
        public async Task<ActionResult<RegistrationDto>> RegisterSelf(
            int eventId, [FromQuery(Name = "createOrder")] bool createOrder)
        {
            _logger.LogInformation("RegisterSelf called with EventId: {eventId}, CreateOrder: {createOrder}", eventId, createOrder);

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("RegisterSelf called with invalid eventId: {eventId}", eventId);
                return BadRequest("Invalid eventId.");
            }


            var registration = await _registrationManagementService.CreateRegistrationAsync(eventId, User.GetUserId(), new RegistrationOptions
            {
                CreateOrder = createOrder
            });

            return new RegistrationDto(registration);

        }

        [HttpPut("{id}")]
        public async Task<ActionResult<RegistrationDto>> UpdateRegistration(int id,
            [FromBody] RegistrationFormDto dto,
            CancellationToken cancellationToken)
        {
            _logger.LogInformation("UpdateRegistration called with ID: {id}", id);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var registration = await _registrationRetrievalService.GetRegistrationByIdAsync(id, null, cancellationToken);

            if (registration == null)
            {
                return NotFound("Registration not found.");
            }

            dto.CopyTo(registration);

            await _registrationManagementService.UpdateRegistrationAsync(registration, cancellationToken);

            return new RegistrationDto(registration);
        }




        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelRegistration(int id, CancellationToken cancellationToken)
        {
            _logger.LogInformation("CancelRegistration called with ID: {id}", id);

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("CancelRegistration called with invalid registration ID: {id}", id);
                return BadRequest("Invalid registration ID.");
            }

            var registration = await _registrationRetrievalService.GetRegistrationByIdAsync(id, null, cancellationToken);

            if (registration == null)
            {
                _logger.LogWarning("CancelRegistration called with non-existent registration ID: {id}", id);
                return NotFound("Registration not found.");
            }

            registration.MarkAsCancelled();

            await _registrationManagementService.UpdateRegistrationAsync(registration, cancellationToken);

            return Ok();
        }



        private static RegistrationRetrievalOptions RetrievalOptions(RegistrationsQueryDto query)
        {
            return new()
            {
                LoadUser = query.IncludeUserInfo,
                LoadEventInfo = query.IncludeEventInfo,
                LoadProducts = query.IncludeProducts,
                LoadOrders = query.IncludeOrders
            };
        }
    }
}
