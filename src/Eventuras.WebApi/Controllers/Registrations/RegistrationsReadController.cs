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
    [Authorize]
    [Route("v{version:apiVersion}/registrations")]
    [ApiController]
    public class RegistrationsReadController : ControllerBase
    {
        private readonly IRegistrationRetrievalService _registrationRetrievalService;

        public RegistrationsReadController(IRegistrationRetrievalService registrationRetrievalService)
        {
            _registrationRetrievalService = registrationRetrievalService ?? throw
                new ArgumentNullException(nameof(registrationRetrievalService));
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
        public async Task<ActionResult<RegistrationDto>> GetRegistrationById(int id, [FromQuery] RegistrationsQueryDto query, CancellationToken cancellationToken)
        {
            var registration = await _registrationRetrievalService.GetRegistrationByIdAsync(id, RetrievalOptions(query));

            return Ok(new RegistrationDto(registration));
        }

        private static RegistrationRetrievalOptions RetrievalOptions(RegistrationsQueryDto query)
        {
            return new RegistrationRetrievalOptions
            {
                IncludeUser = query.IncludeUserInfo,
                IncludeEventInfo = query.IncludeEventInfo,
                IncludeProducts = query.IncludeProducts,
                IncludeOrders = query.IncludeOrders
            };
        }
    }
}
