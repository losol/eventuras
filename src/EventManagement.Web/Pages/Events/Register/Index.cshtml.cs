using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

using losol.EventManagement.Domain;
using losol.EventManagement.Pages.Account;
using losol.EventManagement.Services;
using losol.EventManagement.ViewModels;
using losol.EventManagement.Web.Services;
using losol.EventManagement.Services.Extensions;
using System.Text;
using Mapster;

namespace losol.EventManagement.Web.Pages.Events.Register
{
	public class EventRegistrationModel : PageModel
	{
		private readonly UserManager<ApplicationUser> _userManager;
		private readonly RegistrationEmailSender _registrationEmailSender;
		private readonly ILogger<EventRegistrationModel> _logger;
		private readonly IEventInfoService _eventsService;
		private readonly IPaymentMethodService _paymentMethodService;
		private readonly IRegistrationService _registrationService;

		public EventRegistrationModel(
			UserManager<ApplicationUser> userManager,
			RegistrationEmailSender registrationEmailSender,
			StandardEmailSender standardEmailSender,
			ILogger<EventRegistrationModel> logger,
			IEventInfoService eventsService,
			IPaymentMethodService paymentMethodService,
			IRegistrationService registrationService
		)
		{
			_userManager = userManager;
			_registrationEmailSender = registrationEmailSender;
			_logger = logger;
			_eventsService = eventsService;
			_paymentMethodService = paymentMethodService;
			_registrationService = registrationService;
		}

		[BindProperty]
		public RegisterVM Registration { get; set; }
		public List<Product> Products => Registration.EventInfo.Products;
		public int DefaultPaymentMethod => _paymentMethodService.GetDefaultPaymentMethodId();

		public async Task<IActionResult> OnGetAsync(int id)
		{
			var eventInfo = await _eventsService.GetWithProductsAsync(id);
			if (eventInfo == null)
			{
				return NotFound();
			}

			Registration = new RegisterVM(eventInfo, DefaultPaymentMethod);
			Registration.PaymentMethods = await _paymentMethodService.GetActivePaymentMethodsAsync();
			Registration.EventInfo = eventInfo;
			return Page();
		}

		public async Task<IActionResult> OnPostAsync(int id)
		{

			if (!ModelState.IsValid)
			{
				return Page();
			}

			Registration.EventInfo = await _eventsService.GetWithProductsAsync(id);
			if (Registration.EventInfo == null) return NotFound();

			// Check if user exists with email registered
			var user = await _userManager.FindByEmailAsync(Registration.Email);
			if (user != null)
			{
				Registration.UserId = user.Id;
				_logger.LogInformation("Found existing user.");

				// Any registrations for this user on this event?
				var registration = await _registrationService.GetAsync(user.Id, Registration.EventInfoId);
				if (registration != null)
				{
					// The user has already registered for the event.
					await _registrationEmailSender.SendAsync(user.Email, "Du var allerede påmeldt!", registration.RegistrationId);
					return RedirectToPage("/Info/EmailSent");
				}
			}
			else
			{
				// Create new user
				var newUser = new ApplicationUser { UserName = Registration.Email, Name = Registration.ParticipantName, Email = Registration.Email, PhoneNumber = (Registration.PhoneCountryCode + Registration.Phone) };
				var result = await _userManager.CreateAsync(newUser);

				if (result.Succeeded)
				{
					_logger.LogInformation("User created a new account with password.");

					Registration.UserId = newUser.Id;
				}
				else
				{
					foreach (var error in result.Errors)
					{
						ModelState.AddModelError(string.Empty, error.Description);
					}
					return Page();
				}
			}

			// If we came here, we should enter our new participant into the database!
			var entry = Registration.Adapt<Registration>();
			entry.VerificationCode = PasswordHelper.GeneratePassword(length: 6);
			int[] selectedProductIds = null;
			int[] selectedVariantIds = null;

			// If the eventinfo has products, then register and make order
			if (Registration.HasProducts)
			{
				_logger.LogInformation("Products!");
				// Populate the ids required to create the registration
				selectedProductIds = Registration.SelectedProducts.ToArray();
				selectedVariantIds = Registration.SelectedVariants.ToArray();
			}

			_logger.LogInformation("Creating registration");
			await _registrationService.CreateRegistration(entry, selectedProductIds, selectedVariantIds);
			_logger.LogInformation("Registration created");
			await _registrationEmailSender.SendAsync(user.Email, "Bekreft påmeldingen!", entry.RegistrationId);

			return RedirectToPage("/Info/EmailSent");
		}

	}
}
