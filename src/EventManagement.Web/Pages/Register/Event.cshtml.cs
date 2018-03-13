using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Mapster;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using losol.EventManagement.Pages.Account;
using losol.EventManagement.Services;
using losol.EventManagement.ViewModels;

namespace losol.EventManagement.Pages.Register
{
	public class EventRegistrationModel : PageModel
	{
		private readonly UserManager<ApplicationUser> _userManager;
		private readonly ILogger<LoginModel> _logger;
		private readonly IEmailSender _emailSender;
		private readonly IRenderService _renderService;
		private readonly IEventInfoService _eventsService;
		private readonly IPaymentMethodService _paymentMethodService;
		private readonly IRegistrationService _registrationService;


		public EventRegistrationModel(
			UserManager<ApplicationUser> userManager,
			ILogger<LoginModel> logger,
			IEmailSender emailSender,
			IRenderService renderService,
			IEventInfoService eventsService,
			IPaymentMethodService paymentMethodService,
			IRegistrationService registrationService
			)
		{
			_userManager = userManager;
			_logger = logger;
			_emailSender = emailSender;
			_renderService = renderService;
			_eventsService = eventsService;
			_paymentMethodService = paymentMethodService;
			_registrationService = registrationService;
		}

		[BindProperty]
		public RegisterVM Registration { get; set; }
		public EventInfo EventInfo { get; set; }
		public List<Product> Products => EventInfo.Products;
		public List<PaymentMethod> PaymentMethods { get; set; }

		public async Task<IActionResult> OnGetAsync(int? id)
		{
			if (id == null)
			{
				return RedirectToPage("./Index");
			}

			EventInfo = await _eventsService.GetWithProductsAsync(id.Value);

			if (EventInfo == null)
			{
				return NotFound();
			}

			PaymentMethods = await _paymentMethodService.GetActivePaymentMethodsAsync();
			var defaultPaymentMethod = _paymentMethodService.GetDefaultPaymentMethodId();
			Registration = new RegisterVM(EventInfo, defaultPaymentMethod);

			return Page();
		}


		public async Task<IActionResult> OnPostAsync(int? id)
		{
			if (id == null)
			{
				return RedirectToPage("./Index");
			}

			EventInfo = await _eventsService.GetWithProductsAsync(id.Value);

			if (EventInfo == null)
			{
				return NotFound();
			}

			Registration.EventInfoId = EventInfo.EventInfoId;

			if (!ModelState.IsValid)
			{
				PaymentMethods = await _paymentMethodService.GetActivePaymentMethodsAsync();
				return Page();
			}

			if (Registration.Products != null)
			{
				var selectedProductIds = Registration.Products
													 .Where(rp => rp.IsSelected)
													 .Select(p => p.Value)
													 .ToList();

				var registeredProducts = EventInfo.Products
												  .Where(x => selectedProductIds.Contains(x.ProductId))
												  .ToList();

				// Get the list of product names along with id and variants ...
				var productNames = registeredProducts.Select(product =>
				{
					var variantId = Registration.Products
											  .Where(p => product.ProductId == p.Value)
											  .Select(p => p.SelectedVariantId)
											  .FirstOrDefault();

					var variantString = "";
					if (variantId != null)
					{
						var variantName = Products.Where(p => p.ProductId == product.ProductId)
											  .SelectMany(p => p.ProductVariants)
											  .Where(v => v.ProductVariantId == variantId)
											  .Select(v => v.Name)
											  .Single();

						variantString = $" ({variantId}. {variantName})";
					}

					return $"{product.ProductId}. {product.Name}{variantString}";
				});

				// ... and concatenate them together into the notes field
				Registration.Notes = String.Join(", ", productNames);
			}

			// Check if user exists with email registered
			var user = await _userManager.FindByEmailAsync(Registration.Email);

			if (user != null)
			{
				Registration.UserId = user.Id;
				_logger.LogInformation("Found existing user.");
			}
			else
			{
				// Create new user
				var newUser = new ApplicationUser { UserName = Registration.Email, Name = Registration.ParticipantName, Email = Registration.Email, PhoneNumber = Registration.Phone };
				var result = await _userManager.CreateAsync(newUser);

				if (result.Succeeded)
				{
					_logger.LogInformation("User created a new account with password.");

					Registration.UserId = newUser.Id;
					user = newUser;

				}
				foreach (var error in result.Errors)
				{
					ModelState.AddModelError(string.Empty, error.Description);
				}
			};

			// Any registrations for this user on this event?
			var registered = await _registrationService.GetAsync(user.Id, Registration.EventInfoId);

			// If registration found
			if (registered != null)
			{
				_logger.LogWarning("Found existing registration:" + registered.RegistrationId);
				// Prepare an email to send out
				var emailVM = new EmailMessage()
				{
					Name = Registration.ParticipantName,
					Email = Registration.Email,
					Subject = "Du var allerede påmeldt!",
					Message = @"Vi hadde allerede registrert deg i systemet.
								Ta kontakt med ole@nordland-legeforening hvis du tror det er skjedd noe feil her!
								"
				};

				// If registered but not verified, just send reminder of verification. 
				if (registered.Verified == false)
				{
					var verificationUrl = Url.Action("Confirm", "Register", new { id = registered.RegistrationId, auth = registered.VerificationCode }, protocol: Request.Scheme);
					emailVM.Subject = "En liten bekreftelse bare...";
					emailVM.Message = $@"Vi hadde allerede registrert deg i systemet, men du har ikke bekreftet enda
								Ta kontakt med ole@nordland-legeforening hvis du tror det er skjedd noe feil her!
								<p><a href='{verificationUrl}'>Bekreft her</a></p>
								<p></p>
								<p>Hvis lenken ikke virker, så kan du kopiere inn teksten under i nettleseren:
								{verificationUrl} </p>";
				}

				var emailString = await _renderService.RenderViewToStringAsync("Templates/Email/StandardEmail", emailVM);
				await _emailSender.SendEmailAsync(emailVM.Email, emailVM.Subject, emailString);

				return RedirectToPage("/Info/EmailSent");
			}

			// If we came here, we should enter our new participant into the database!
			_logger.LogWarning("Starting new registration:");


			var newRegistration = Registration.Adapt<Registration>();
			newRegistration.VerificationCode = generateRandomPassword(6);
			await _registrationService.CreateRegistrationForUser(newRegistration);


			var confirmEmail = new ConfirmEventRegistration()
			{
				Name = Registration.ParticipantName,
				Phone = Registration.Phone,
				Email = Registration.Email,
				PaymentMethod = Registration.PaymentMethodId.ToString(),
				EventTitle = EventInfo.Title,
				EventDescription = EventInfo.Description
			};

			confirmEmail.VerificationUrl = Url.Action("Confirm", "Register", new { id = newRegistration.RegistrationId, auth = newRegistration.VerificationCode }, protocol: Request.Scheme);

			var email = await _renderService.RenderViewToStringAsync("Templates/Email/ConfirmEventRegistration", confirmEmail);
			await _emailSender.SendEmailAsync(Registration.Email, "Bekreft påmelding", email);

			return RedirectToPage("/Info/EmailSent");
		}

		private static string generateRandomPassword(int length = 6)
		{
			string[] randomChars = new[] {
				"ABCDEFGHJKLMNPQRSTUVWXYZ",    // uppercase 
                "abcdefghijkmnpqrstuvwxyz",    // lowercase
                "123456789"                   // digits
            };
			Random rand = new Random(Environment.TickCount);

			List<char> chars = new List<char>();

			for (int i = chars.Count; i < length; i++)
			{
				string rcs = randomChars[rand.Next(0, randomChars.Length)];
				chars.Insert(rand.Next(0, chars.Count),
					rcs[rand.Next(0, rcs.Length)]);
			}

			return new string(chars.ToArray());
		}

		#region View Models
		public class ProductVM
		{
			public bool IsSelected { get; set; } = false;
			public int Value { get; set; }
			public bool IsMandatory { get; set; } = false;
			public int? SelectedVariantId { get; set; } = null;
		}

		public class RegisterVM
		{
			public int EventInfoId { get; set; }
			public string UserId { get; set; }

			[Required]
			[StringLength(100)]
			[Display(Name = "Navn")]
			public string ParticipantName { get; set; }

			[Required]
			[EmailAddress]
			[Display(Name = "E-post")]
			public string Email { get; set; }

			[Required]
			[Display(Name = "Mobiltelefon")]
			public string Phone { get; set; }

			[Display(Name = "Arbeidsplass")]
			public string ParticipantEmployer { get; set; }

			[Display(Name = "Stilling")]
			public string ParticipantJobTitle { get; set; }

			[Display(Name = "Sted/by")]
			public string ParticipantCity { get; set; }

			[Display(Name = "Kommentar til påmelding. ")]
			public string Notes { get; set; }

			[Display(Name = "Organisasjonsnummer (må fylles ut for EHF-faktura)")]
			public string CustomerVatNumber { get; set; }

			// Who pays for it?
			[Display(Name = "Fakturamottakers firmanavn")]
			public string CustomerName { get; set; }

			[Display(Name = "Fakturamottakers epost")]
			public string CustomerEmail { get; set; }

			[Display(Name = "Fakturareferanse")]
			public string CustomerInvoiceReference { get; set; }

			[Display(Name = "Betaling")]
			public int? PaymentMethodId { get; set; }

			public ProductVM[] Products { get; set; }

			public RegisterVM() { }
			public RegisterVM(EventInfo eventinfo, int? defaultPaymentMethod = null) 
			{
				EventInfoId = eventinfo.EventInfoId;
				PaymentMethodId = defaultPaymentMethod;

				Products = new ProductVM[eventinfo.Products.Count];
				for (int i = 0; i < Products.Length; i++)
				{
					var currentProduct = eventinfo.Products[i];
					Products[i] = new ProductVM
					{
						Value = currentProduct.ProductId,
						IsMandatory = currentProduct.MandatoryCount > 0,
						IsSelected = currentProduct.MandatoryCount > 0,
						SelectedVariantId = currentProduct
							.ProductVariants
							.Select(pv => pv.ProductVariantId as int?)
							.FirstOrDefault()
					};
				}
			}
		}
		#endregion
	}
}
