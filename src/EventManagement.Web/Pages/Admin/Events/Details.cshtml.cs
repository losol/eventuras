using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;

namespace losol.EventManagement.Pages.Admin.Events
{
    public class DetailsModel : PageModel
    {
        private readonly ApplicationDbContext _context;

        public DetailsModel(ApplicationDbContext context)
        {
            _context = context;
        }

        public EventInfo EventInfo { get; set; }

        public class RegistrationsVm
        {
        public int RegistrationId {get;set;}
        public string Name { set;get;}
        public string Email { set;get;}
        public string Phone { set;get;}
        public string Employer {get;set;}
        public bool Attended {get;set;}
        public string JobTitle {get;set;}
        public string City {get;set;}
        public bool HasCertificate { get; set; }
        }

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            EventInfo = await _context.EventInfos
                .Include(e => e.Products)
                .Include(e => e.Registrations)
                .SingleOrDefaultAsync(m => m.EventInfoId == id);

            if (EventInfo == null)
            {
                return NotFound();
            }
            //EventInfo.
            
            return Page();
        }

         
        public async Task<JsonResult> OnGetParticipants(int? id)
        {
            if (id == null)
            {
               return new JsonResult("No event id submitted.");
            }

            var registrations = await _context.Registrations
                .Where( r => r.EventInfoId == id)
                .Select ( x=> new RegistrationsVm{
                    RegistrationId = x.RegistrationId,
                    Name = x.User.Name,
                    Email = x.User.Email,
                    Phone = x.User.PhoneNumber,
                    Attended = x.Attended,
                    JobTitle = x.ParticipantJobTitle,
                    Employer = x.ParticipantEmployer,
                    City = x.ParticipantCity,
                    HasCertificate = x.HasCertificate
                    })
                .ToListAsync();

            if (registrations.Any()) {
                return new JsonResult(registrations);
            }
            else {
                return new JsonResult("none");
            }

            
        }

        public async Task<JsonResult> OnGetAttendance(int? registrationId, bool? attended)
        {
            // TODO this should not use GET, but POST?
            
            if (registrationId == null) {
                return new JsonResult(new { success = false, responseText = "No registrationId submitted" });
            }
            
            var registration = await _context.Registrations
                .Where( r => r.RegistrationId == registrationId)
                .FirstOrDefaultAsync();

            if (attended == null && registration != null) {
                return new JsonResult(new { success = true, responseText = registration.Attended });
            }

            if (attended != null && registration != null) {
                registration.Attended = (bool)attended;
                await _context.SaveChangesAsync();
                return new JsonResult(new { success = true, responseText = registration.Attended });
            }

            return new JsonResult(new { success = false, responseText = "Something went wrong." });
        }
    }
}
