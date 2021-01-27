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
    [Authorize("registrations:read")]
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
            [FromQuery] PageQueryDto query,
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
                            AccessibleOnly = true
                        },
                        OrderBy = RegistrationListOrder.RegistrationTime,
                        Descending = true
                    },
                    RegistrationRetrievalOptions.Default,
                    cancellationToken);

            return PageResponseDto<RegistrationDto>.FromPaging(
                query, paging, r => new RegistrationDto(r));
        }
    }
}
