using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc.Versioning;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using losol.EventManagement.Services;
using Microsoft.AspNetCore.Authorization;
using losol.EventManagement.ViewModels;

namespace losol.EventManagement.Web.Controllers.Api.V1
{
    [ApiVersion("1.0")]
    [Authorize(Policy = "AdministratorRole")]
    [Route("api/v1/registrations")]
    [ApiController]
    public class RegistrationsController : ControllerBase
    {
        private readonly RegistrationService _registrationService;

        public RegistrationsController(RegistrationService registrationService)
        {
            _registrationService = registrationService;
        }

        // GET: api/v1/registrations
        // Returns the latest 100 registrations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RegistrationVM>>> GetRegistrations()
        {
            var registrations = await _registrationService.GetAsync();
            var vmlist = registrations.Select(m => _registrationVM(m));
            return Ok(vmlist);
        }

        // GET: api/v1/registrations/5
        [HttpGet("{id}")]
        public async Task<ActionResult<RegistrationVM>> GetRegistration(int id)
        {
            var registration = await _registrationService.GetAsync(id);

            if (registration == null)
            {
                return NotFound();
            }

            return _registrationVM(registration);
        }

        // PUT: api/v1/registrations/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see https://aka.ms/RazorPagesCRUD.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRegistration(int id, Registration registration)
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
        public async Task<ActionResult<Registration>> PostRegistration(Registration registration)
        {
            throw new NotImplementedException();
            // return CreatedAtAction("GetRegistration", new { id = registration.RegistrationId }, registration);
        }

        // DELETE: api/v1/registrations/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<Registration>> DeleteRegistration(int id)
        {
            throw new NotImplementedException();
        }

        private ActionResult<RegistrationVM> _registrationVM(Registration registration)
        {
            var reg = new RegistrationVM();
            reg.EventId = registration.EventInfoId;
            reg.UserId = registration.UserId;
            reg.Status = registration.Status;
            reg.Type = registration.Type;

            return reg;
        }


    }
}
