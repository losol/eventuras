using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Eventuras.Domain;
using Eventuras.Services;
using Microsoft.AspNetCore.Identity;
using Mapster;
using static Eventuras.Domain.PaymentMethod;
using Eventuras.Infrastructure;
using Eventuras.Services.Events;

namespace Eventuras.Pages.Admin.Events
{
    public class AddRegistrationModel : PageModel
    {
        private readonly IEventInfoRetrievalService _eventsService;
        private readonly IRegistrationService _registrations;
        private readonly IOrderService _orders;
        private readonly IPaymentMethodService _paymentMethodService;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _db;


        public AddRegistrationModel(IOrderService orders, IEventInfoRetrievalService eventInfos, IRegistrationService registrations, IPaymentMethodService paymentMethods, UserManager<ApplicationUser> userManager, ApplicationDbContext db)
        {
            _eventsService = eventInfos;
            _orders = orders;
            _registrations = registrations;
            _paymentMethodService = paymentMethods;
            _userManager = userManager;
            _db = db;
        }

        [BindProperty]
        public Web.Pages.Events.Register.RegisterVM Registration { get; set; } // TODO change this?

        public EventInfo EventInfo { get; set; }
        public List<PaymentMethod> PaymentMethods { get; set; }
        public List<Product> Products => EventInfo.Products;
        public PaymentProvider DefaultPaymentMethod => _paymentMethodService.GetDefaultPaymentProvider();

        public async Task<IActionResult> OnGetAsync(int id)
        {
            EventInfo ??= await _eventsService.GetEventInfoByIdAsync(id, new EventInfoRetrievalOptions
            {
                LoadProducts = true
            });
            if (EventInfo == null) return NotFound();

            PaymentMethods = await _paymentMethodService.GetActivePaymentMethodsAsync();
            Registration = new Web.Pages.Events.Register.RegisterVM(EventInfo, DefaultPaymentMethod);

            return Page();
        }

        public async Task<IActionResult> OnPostAsync(int id)
        {
            ModelState.Clear(); // Clear the validation errors, will validate manually later.
            if (string.IsNullOrWhiteSpace(Registration.UserId))
            {
                ModelState.AddModelError("UserId", "User field is required.");
                return await OnGetAsync(id);
            }
            // Check if user exists with email registered, and create new user if not.
            var user = await _userManager.FindByIdAsync(Registration.UserId);
            if (user == null)
            {
                // This shouldn't happen, because a registration can only
                // be created for existing users.
                ModelState.AddModelError(string.Empty, "Invalid user selected.");
                return await OnGetAsync(id);
            }
            Registration.ParticipantName = user.Name;
            Registration.Email = user.Email;
            Registration.Phone = user.PhoneNumber;

            EventInfo = await _eventsService.GetEventInfoByIdAsync(id, new EventInfoRetrievalOptions
            {
                LoadProducts = true
            });
            if (EventInfo == null) return NotFound();

            Registration.EventInfoId = id;
            Registration.UserId = user.Id;

            // Any registrations for this user on this event?
            var registration = await _registrations.GetAsync(Registration.UserId, Registration.EventInfoId);
            if (registration != null)
            {
                ModelState.AddModelError(string.Empty, "Bruker var allerede registrert");
                return await OnGetAsync(id);
            }

            // Validate the VM
            if (!TryValidateModel(Registration))
            {
                ModelState.AddModelError(string.Empty, "Please check the form before submitting.");
                return await OnGetAsync(id);
            }

            // Create registration for our user
            var newRegistration = Registration.Adapt<Registration>();
            await _registrations.CreateRegistration(newRegistration);
            await _db.SaveChangesAsync();

            return RedirectToPage("./Details", new { id = id });
        }
    }
}
