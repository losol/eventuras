using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services;

namespace Eventuras.Pages.Admin.Registrations
{
    public class CreateModel : PageModel
    {
        private readonly ApplicationDbContext _context;
        private readonly IPaymentMethodService _paymentMethods;

        public CreateModel(ApplicationDbContext context, IPaymentMethodService paymentMethods)
        {
            _context = context;
            _paymentMethods = paymentMethods;
        }

        public async Task<IActionResult> OnGetAsync()
        {
            ViewData["EventInfoId"] = new SelectList(_context.EventInfos, "EventInfoId", "Code");
            ViewData["PaymentMethod"] = new SelectList(await _paymentMethods.GetActivePaymentMethodsAsync(), "Provider", "Name");
            ViewData["UserId"] = new SelectList(_context.ApplicationUsers, "Id", "Id");
            return Page();
        }

        [BindProperty]
        public Registration Registration { get; set; }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            _context.Registrations.Add(Registration);
            await _context.SaveChangesAsync();

            return RedirectToPage("./Index");
        }
    }
}