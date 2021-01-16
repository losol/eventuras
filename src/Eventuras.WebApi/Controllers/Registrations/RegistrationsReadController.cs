using Eventuras.Services.Registrations;
using Eventuras.WebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
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

        // GET: v3/registrations
        // Returns the latest 100 registrations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RegistrationDto>>> GetRegistrations(CancellationToken cancellationToken)
        {
            var registrations = await _registrationRetrievalService
                .ListRegistrationsAsync(
                    new RegistrationListRequest
                    {
                        Filter = new RegistrationFilter
                        {
                            AccessibleOnly = true
                        },
                        OrderBy = RegistrationListOrder.RegistrationTime,
                        Descending = true
                    },
                    RegistrationRetrievalOptions.Default,
                    cancellationToken);

            return Ok(registrations.Data.Select(r => new RegistrationDto(r)));
        }
    }
}
