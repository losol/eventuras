using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using losol.EventManagement.Data;
using losol.EventManagement.Models;

namespace losol.EventManagement.Pages.Register
{
    public class EventRegistrationModel : PageModel
    {
        private readonly losol.EventManagement.Data.ApplicationDbContext _context;
        public string EventTitle;
        public string EventDescription;

        public EventRegistrationModel(ApplicationDbContext context)
        {
            _context = context;
        }

        [BindProperty]
        public Models.Registration Registration { get; set; }

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var eventinfo = await _context.EventInfos.FirstOrDefaultAsync(m => m.EventInfoId == id);
            if (eventinfo == null)
            {
                return NotFound();
                
            }
            else 
            {
            EventTitle = eventinfo.Title;
            EventDescription = eventinfo.Description;
            // this.Registration.EventId = eventinfo.EventInfoId;
            }
            return Page();
        }


        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            //_context.Registrations.Add(Registration);
            //await _context.SaveChangesAsync();

            return RedirectToPage("./Index");
        }
    }
}