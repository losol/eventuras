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
        private IPageRenderService _pageRenderService;
        

        public EventRegistrationModel(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            ILogger<LoginModel> logger,
            IEmailSender emailSender,
            IOptions<AppSettings> appSettings,
            IHostingEnvironment env,
            IPageRenderService pageRenderService
            )  
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
            _emailSender = emailSender;
            _appSettings = appSettings.Value;
            _env = env;
            _pageRenderService = pageRenderService;
        }

        [BindProperty]
        public RegisterVM Registration { get; set; }

        public class RegisterVM
        {
            public int EventInfoId {get;set;}
            public string EventInfoTitle {get;set;}
            public string EventInfoDescription {get;set;}
            public string UserId {get;set;}

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

            public int PaymentMethodId {get;set;}
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
               

               Registration.PaymentMethods = _context.PaymentMethods.ToList();
            }
            return Page() ;
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

                    

                    // Uncomment to enable email verifcation

                    //var code = await _userManager.GenerateEmailConfirmationTokenAsync(newUser);
                    //var callbackUrl = Url.EmailConfirmationLink(newUser.Id, code, Request.Scheme);
                    //await _emailSender.SendEmailConfirmationAsync(Registration.Email, callbackUrl);
                }
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(string.Empty, error.Description);
                }
            };

            var entry = _context.Add(new Registration());
            entry.CurrentValues.SetValues(Registration);            
            await _context.SaveChangesAsync();

            Console.WriteLine("*********^^^^^^^^^^^^^^^^^^vvvvvvvvvvv");
			var confirmEmail = new ConfirmEventRegistration() {
                Name = "Test Person",
                Phone = "123123",
                Email = "losvik@gmail.com",
                PaymentMethod = "CARD HELL YEAH",
                EventTitle = "Moroevent",
                EventDescription = "Midt i januar",
                EventDate = "01.01.2018",
                EventUrl = "Https://vg.no"
            };

            confirmEmail.VerificationUrl = "/Register/Confirm/1";
			var email = await _pageRenderService.RenderPageToStringAsync("Templates/Email/ConfirmEventRegistration", confirmEmail);
            await _emailSender.SendEmailAsync("losvik@gmail.com","Test45",email);
			Console.WriteLine(email);
            
            return RedirectToPage("/Register/Confirmed");
        }
    }
}