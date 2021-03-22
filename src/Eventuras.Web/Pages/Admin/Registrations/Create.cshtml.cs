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
using Eventuras.Services.Events;
using Eventuras.Services.Users;

namespace Eventuras.Pages.Admin.Registrations
{
    public class CreateModel : PageModel
    {
        private readonly ApplicationDbContext _context;
        private readonly IPaymentMethodService _paymentMethods;
        private readonly IEventInfoRetrievalService _eventInfoRetrievalService;
        private readonly IUserRetrievalService _userListingService;

        public CreateModel(
            ApplicationDbContext context,
            IPaymentMethodService paymentMethods,
            IEventInfoRetrievalService eventInfoRetrievalService,
            IUserRetrievalService userListingService)
        {
            _context = context;
            _paymentMethods = paymentMethods;
            _eventInfoRetrievalService = eventInfoRetrievalService;
            _userListingService = userListingService;
        }

        public async Task<IActionResult> OnGetAsync()
        {
            ViewData["EventInfoId"] = new SelectList(await _eventInfoRetrievalService.ListEventsAsync(), "EventInfoId", "Code");
            ViewData["PaymentMethod"] = new SelectList(await _paymentMethods.GetActivePaymentMethodsAsync(), "Provider", "Name");
            ViewData["UserId"] = new SelectList(await _userListingService.ListUsersAsync(), "Id", "Id");
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