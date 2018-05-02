using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;

namespace losol.EventManagement.Pages.Admin.Organizations
{
    public class DetailsModel : PageModel
    {
        private readonly ApplicationDbContext _context;

        public DetailsModel(ApplicationDbContext context)
        {
            _context = context;
        }

        [BindProperty]
        public Organization Organization { get; set; }

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            Organization = await _context.Organizations
                .SingleOrDefaultAsync(m => m.OrganizationId == id);

            if (Organization == null)
            {
                return NotFound();
            }
            return Page();
        }

         public async Task<IActionResult> OnPostAsync(int? id)
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            _context.Organizations.Update(Organization);
            await _context.SaveChangesAsync();
            return RedirectToPage("./Index");
        }
    }
}
