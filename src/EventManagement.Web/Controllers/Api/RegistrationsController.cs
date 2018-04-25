using System;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using losol.EventManagement.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using static losol.EventManagement.Domain.Registration;
using System.Collections.Generic;
using System.Linq;

namespace losol.EventManagement.Web.Controllers.Api {
    [Authorize (Policy = "AdministratorRole")]
    [Route ("/api/v0/registrations")]
    public class RegistrationsController : Controller {
        private readonly IRegistrationService _registrationsService;

        public RegistrationsController (IRegistrationService registrationsService) {
            _registrationsService = registrationsService;
        }

        [HttpPost ("participant/update/{id}")]
        public async Task<ActionResult> UpdateParticipantInfo ([FromRoute] int id, [FromBody] ParticipantInfoVM vm) {
            if (!ModelState.IsValid) return BadRequest ();
            try {
                await _registrationsService.UpdateParticipantInfo (
                    id,
                    vm.ParticipantName,
                    vm.ParticipantJobTitle,
                    vm.ParticipantCity,
                    vm.ParticipantEmployer);
            } 
            catch (ArgumentException) {
                return BadRequest ();
            }
            return Ok ();
        }

        [HttpPost ("status/update/{id}/{status}")]
        public async Task<ActionResult> UpdateRegistrationStatus ([FromRoute] int id, [FromRoute] RegistrationStatus status) {
            try {
                await _registrationsService.UpdateRegistrationStatus(id, status);
                return Ok ();
            } catch (Exception e) when (e is InvalidOperationException || e is ArgumentException) {
                return BadRequest ();
            }
        }
        
        [HttpPost ("type/update/{id}/{type}")]
        public async Task<ActionResult> UpdateRegistrationType ([FromRoute] int id, [FromRoute] RegistrationType type) {
            try {
                await _registrationsService.UpdateRegistrationType(id, type);
                return Ok ();
            } catch (Exception e) when (e is InvalidOperationException || e is ArgumentException) {
                return BadRequest ();
            }
        }

        public class ParticipantInfoVM {
            public string ParticipantName { get; set; }

            public string ParticipantJobTitle { get; set; }

            public string ParticipantCity { get; set; }
            public string ParticipantEmployer { get; set; }
        }

    }
}