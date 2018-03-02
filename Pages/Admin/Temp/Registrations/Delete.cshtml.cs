using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using losol.EventManagement.Data;
using losol.EventManagement.Models;

namespace losol.EventManagement.Pages.Admin.Temp.Registrations
{
    public class DeleteModel : PageModel
    {
        private readonly losol.EventManagement.Data.ApplicationDbContext _context;

        public DeleteModel(losol.EventManagement.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        [BindProperty]
        public Registration Registration { get; set; }

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            Registration = await _context.Registrations
                .Include(r => r.EventInfo)
                .Include(r => r.PaymentMethod)
                .Include(r => r.User).SingleOrDefaultAsync(m => m.RegistrationId == id);

            if (Registration == null)
            {
                return NotFound();
            }
            return Page();
        }

        public async Task<IActionResult> OnPostAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            Registration = await _context.Registrations.FindAsync(id);

            if (Registration != null)
            {
                _context.Registrations.Remove(Registration);
                await _context.SaveChangesAsync();
            }

            return RedirectToPage("./Index");
        }
    }
}
