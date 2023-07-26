using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services;

namespace Eventuras.Pages.Admin.Registrations
{
    public class DetailsModel : PageModel
    {
        private readonly ApplicationDbContext _context;
        private readonly IPaymentMethodService _paymentMethods;

        public DetailsModel(ApplicationDbContext context, IPaymentMethodService paymentMethods)
        {
            _context = context;
            _paymentMethods = paymentMethods;
        }

        public Registration Registration { get; set; }
        public List<PaymentMethod> PaymentMethods { get; set; }

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            Registration = await _context.Registrations
                .Include(r => r.EventInfo)
                .Include(r => r.Orders)
                .Include(r => r.User).SingleOrDefaultAsync(m => m.RegistrationId == id);

            PaymentMethods = await _paymentMethods.GetActivePaymentMethodsAsync();

            if (Registration == null)
            {
                return NotFound();
            }
            return Page();
        }
    }
}
