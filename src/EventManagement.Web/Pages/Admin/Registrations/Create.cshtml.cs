using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using losol.EventManagement.Services;

namespace losol.EventManagement.Pages.Admin.Registrations
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

        public IActionResult OnGet()
        {
        ViewData["EventInfoId"] = new SelectList(_context.EventInfos, "EventInfoId", "Code");
        ViewData["PaymentMethodId"] = new SelectList(_paymentMethods.GetActivePaymentMethods(), "PaymentMethodId", "Name");
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