using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using losol.EventManagement.Data;
using losol.EventManagement.Models;

namespace losol.EventManagement.Pages.Admin.Events
{
    public class ParticipantsModel : PageModel
    {
        private readonly losol.EventManagement.Data.ApplicationDbContext _context;

        public ParticipantsModel(losol.EventManagement.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        public EventInfo EventInfo { get; set; }

        public class RegistrationsVm
        {
        public string Name { set;get;}
        public string Email { set;get;}
        public string Phone { set;get;}
        public string Employer {get;set;}
        }

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            EventInfo = await _context.EventInfos.SingleOrDefaultAsync(m => m.EventInfoId == id);

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
                    Name = x.User.Name,
                    Email = x.User.Email,
                    Phone = x.User.PhoneNumber
                    })
                .ToListAsync();

            if (registrations.Any()) {
                return new JsonResult(registrations);
            }
            else {
                return new JsonResult("none");
            }

            
        }
    }
}
