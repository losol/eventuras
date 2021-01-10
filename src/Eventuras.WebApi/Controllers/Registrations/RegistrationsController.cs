using Eventuras.Services;
using Eventuras.WebApi.Constants;
using Eventuras.WebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Eventuras.Web.Controllers.Api.V1
{
    [ApiVersion("1")]
    [Authorize(Policy = AuthPolicies.AdministratorRole)]
    [Authorize("registrations:read")]
    [Route("v{version:apiVersion}/registrations")]
    [ApiController]
    public class RegistrationsController : ControllerBase
    {
        private readonly IRegistrationService _registrationService;

        public RegistrationsController(IRegistrationService registrationService)
        {
            _registrationService = registrationService;
        }

        // GET: v1/registrations
        // Returns the latest 100 registrations
        [HttpGet]
        [Authorize("registrations:read")]
        public async Task<ActionResult<IEnumerable<RegistrationDto>>> GetRegistrations()
        {
            var registrations = await _registrationService.GetAsync();
            var vmlist = registrations.Select(m => new RegistrationDto(m));
            return Ok(vmlist);
        }

    }
}
