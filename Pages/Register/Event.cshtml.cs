using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using losol.EventManagement.Data;
using losol.EventManagement.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using losol.EventManagement.Services;
using losol.EventManagement.Pages.Account;
using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using MimeKit;
using losol.EventManagement.ViewModels;

namespace losol.EventManagement.Pages.Register
{
	public class EventRegistrationModel : PageModel
	{
		private readonly ApplicationDbContext _context;
		private readonly UserManager<ApplicationUser> _userManager;
		private readonly ILogger<LoginModel> _logger;
		private readonly IEmailSender _emailSender;
		private readonly AppSettings _appSettings;
		private IHostingEnvironment _env;
		private IRenderService _renderService;


		public EventRegistrationModel(
			ApplicationDbContext context,
			UserManager<ApplicationUser> userManager,
			ILogger<LoginModel> logger,
			IEmailSender emailSender,
			IOptions<AppSettings> appSettings,
			IHostingEnvironment env,
			IRenderService renderService
			)
		{
			_context = context;
			_userManager = userManager;
			_logger = logger;
			_emailSender = emailSender;
			_appSettings = appSettings.Value;
			_env = env;
			_renderService = renderService;
		}

		[BindProperty]
		public RegisterVM Registration { get; set; }

		public class RegisterVM
		{
			public int EventInfoId { get; set; }
			public string EventInfoTitle { get; set; }
			public string EventInfoDescription { get; set; }
			public string UserId { get; set; }

			[Required]
			[StringLength(100)]
			[Display(Name = "Navn")]
			public string Name { get; set; }

			[Required]
			[EmailAddress]
			[Display(Name = "E-post")]
			public string Email { get; set; }

			[Required]
			[Display(Name = "Mobiltelefon")]
			public string Phone { get; set; }

			[Display(Name = "Arbeidsplass")]
			public string Employer { get; set; }

			[Display(Name = "Organisasjonsnummer")]
			public string VatNumber { get; set; }

			[Display(Name = "Betalingsmetode")]
			public IEnumerable<PaymentMethod> PaymentMethods { get; set; }

			public int PaymentMethodId { get; set; }
		}

		public async Task<IActionResult> OnGetAsync(int? id)
		{
			if (id == null)
			{
				return RedirectToPage("./Index");
			}

			Registration = new RegisterVM();

			var eventinfo = await _context.EventInfos.FirstOrDefaultAsync(m => m.EventInfoId == id);
			if (eventinfo == null)
			{
				return NotFound();
			}
			else
			{
				Registration.EventInfoId = eventinfo.EventInfoId;
				Registration.EventInfoTitle = eventinfo.Title;
				Registration.EventInfoDescription = eventinfo.Description;
				Registration.PaymentMethods = _context.PaymentMethods.Where(m => m.Active == true ).ToList();
			}
			return Page();
		}


		public async Task<IActionResult> OnPostAsync(int? id)
		{
			var eventinfo = await _context.EventInfos.FirstOrDefaultAsync(m => m.EventInfoId == id);
			Registration.EventInfoId = eventinfo.EventInfoId;
			Registration.EventInfoTitle = eventinfo.Title;
			Registration.EventInfoDescription = eventinfo.Description;

			if (!ModelState.IsValid)
			{
				return Page();
			}

			// Check if user exists with email registered
			var user = await _userManager.FindByEmailAsync(Registration.Email);

			if (user != null)
			{
				Registration.UserId = user.Id;
			}
			else
			{
				// Create new user
				var newUser = new ApplicationUser { UserName = Registration.Email, Email = Registration.Email, PhoneNumber = Registration.Phone };
				var result = await _userManager.CreateAsync(newUser);

				if (result.Succeeded)
				{
					_logger.LogInformation("User created a new account with password.");

					Registration.UserId = newUser.Id;

				}
				foreach (var error in result.Errors)
				{
					ModelState.AddModelError(string.Empty, error.Description);
				}
			};

			var newRegistration = new Models.Registration();
			newRegistration.VerificationCode = GenerateRandomPassword(6);
			var entry = _context.Add(newRegistration);
			entry.CurrentValues.SetValues(Registration);
			await _context.SaveChangesAsync();

			Console.WriteLine("*********^^^^^^^^^^^^^^^^^^vvvvvvvvvvv");
			var confirmEmail = new ConfirmEventRegistration()
			{
				Name = Registration.Name,
				Phone = Registration.Phone,
				Email = Registration.Email,
				PaymentMethod = Registration.PaymentMethodId.ToString(),
				EventTitle = Registration.EventInfoTitle,
				EventDescription = Registration.EventInfoDescription,
				//EventDate = "01.01.2018",
				//EventUrl = "Https://vg.no"
			};

			confirmEmail.VerificationUrl = Url.Action("Confirm", "Register", new { id = newRegistration.RegistrationId, auth = newRegistration.VerificationCode }, protocol: Request.Scheme);
			Console.WriteLine("^^^*****" +GenerateRandomPassword() + confirmEmail.VerificationUrl);
			var email = await _renderService.RenderViewToStringAsync("Templates/Email/ConfirmEventRegistration", confirmEmail);
			await _emailSender.SendEmailAsync(Registration.Email, "Bekreft påmelding", email);

			return RedirectToPage("/Register/EmailSent");
		}
    
		public static string GenerateRandomPassword(int length = 6)
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
	}
}