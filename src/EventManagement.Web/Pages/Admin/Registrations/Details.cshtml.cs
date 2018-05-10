using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;

namespace losol.EventManagement.Pages.Admin.Registrations
{
    public class DetailsModel : PageModel
    {
        private readonly ApplicationDbContext _context;

        public DetailsModel(ApplicationDbContext context)
        {
            _context = context;
        }

        public Registration Registration { get; set; }
        public List<PaymentMethod> PaymentMethods {get;set;}

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            Registration = await _context.Registrations
                .Include(r => r.EventInfo)
                .Include(r => r.PaymentMethod)
                .Include(r => r.Orders)
                .Include(r => r.User).SingleOrDefaultAsync(m => m.RegistrationId == id);

            PaymentMethods = await _context.PaymentMethods
                .Where (m => m.Active == true)
                .ToListAsync();

            if (Registration == null)
            {
                return NotFound();
            }
            return Page();
        }
    }
}
