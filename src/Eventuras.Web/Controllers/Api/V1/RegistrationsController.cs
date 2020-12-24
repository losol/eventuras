using Eventuras.Services;
using Eventuras.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Eventuras.Web.Controllers.Api.V1
{
    [EnableCors("DefaultCorsPolicy")]
    [ApiVersion("1")]
    [Authorize(Policy = AuthPolicies.AdministratorRole)]
    [Route("api/v1/registrations")]
    [ApiController]
    public class RegistrationsController : ControllerBase
    {
        private readonly IRegistrationService _registrationService;

        public RegistrationsController(IRegistrationService registrationService)
        {
            _registrationService = registrationService;
        }

        // GET: api/v1/registrations
        // Returns the latest 100 registrations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Eventuras.ViewModels.RegistrationViewModel>>> GetRegistrations()
        {
            var registrations = await _registrationService.GetAsync();
            var vmlist = registrations.Select(m => new RegistrationViewModel(m));
            return Ok(vmlist);
        }

        // GET: api/v1/registrations/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Eventuras.ViewModels.RegistrationViewModel>> GetRegistration(int id)
        {
            var registration = await _registrationService.GetAsync(id);

            if (registration == null)
            {
                return NotFound();
            }

            return new Eventuras.ViewModels.RegistrationViewModel((Domain.Registration)registration);
        }

        // PUT: api/v1/registrations/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see https://aka.ms/RazorPagesCRUD.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRegistration(int id, Domain.Registration registration)
        {
            if (id != registration.RegistrationId)
            {
                return BadRequest();
            }

            if (await _registrationService.RegistrationExists(id) == false)
            {
                return NotFound();
            }

            throw new NotImplementedException();
        }

        // POST: api/v1/registrations
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see https://aka.ms/RazorPagesCRUD.
        [HttpPost]
        public async Task<ActionResult<Domain.Registration>> PostRegistration(Domain.Registration registration)
        {
            throw new NotImplementedException();
            // return CreatedAtAction("GetRegistration", new { id = registration.RegistrationId }, registration);
        }

        // DELETE: api/v1/registrations/5
        [HttpDelete("{id}")]
        public Task<ActionResult<Domain.Registration>> DeleteRegistration(int id)
        {
            throw new NotImplementedException();
        }

    }
}
