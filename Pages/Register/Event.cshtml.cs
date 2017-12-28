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

namespace losol.EventManagement.Pages.Register
{
    public class EventRegistrationModel : PageModel
    {
        private readonly losol.EventManagement.Data.ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<LoginModel> _logger;
        private readonly IEmailSender _emailSender;

        public string EventTitle;
        public string EventDescription;

        public EventRegistrationModel(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            ILogger<LoginModel> logger,
            IEmailSender emailSender
            )
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
            _emailSender = emailSender;
        }

        [BindProperty]
        public InputModel Input { get; set; }

        public class InputModel
        {
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
            public PaymentMethod? PaymentMethod { get; set; }
        }

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return RedirectToPage("./Index");
            }

            var eventinfo = await _context.EventInfos.FirstOrDefaultAsync(m => m.EventInfoId == id);
            if (eventinfo == null)
            {
                return NotFound(); 
            }
            else 
            {
            EventTitle = eventinfo.Title;
            EventDescription = eventinfo.Description;
            // this.Registration.EventId = eventinfo.EventInfoId;
            }
            return Page();
        }


        public async Task<IActionResult> OnPostAsync(int? id)
        {
              _logger.LogInformation("*** START REGISTER ***.");

            if (!ModelState.IsValid)
            {
                var eventinfo = await _context.EventInfos.FirstOrDefaultAsync(m => m.EventInfoId == id);
                EventTitle = eventinfo.Title;
                EventDescription = eventinfo.Description;
                return Page();
            }

            _logger.LogInformation("Model valid");
            var submitted_user = new ApplicationUser { UserName = Input.Email, Email = Input.Email, PhoneNumber = Input.Phone };
            
            // Checkt if user exists with email registered
            bool userexist = false;
            var userexistcheck = await _userManager.FindByEmailAsync(Input.Email);
            if (userexistcheck != null) { userexist = true; };
            _logger.LogInformation(userexist.ToString());

            // Create user if user does not exist
            if (!userexist) {
                var result = await _userManager.CreateAsync(submitted_user);
                _logger.LogInformation("UserCreation result: " + userexist.ToString());

                if (result.Succeeded)
                {
                    _logger.LogInformation("User created a new account with password.");

                    var code = await _userManager.GenerateEmailConfirmationTokenAsync(submitted_user);
                    var callbackUrl = Url.EmailConfirmationLink(submitted_user.Id, code, Request.Scheme);
                    await _emailSender.SendEmailConfirmationAsync(Input.Email, callbackUrl);
                }
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(string.Empty, error.Description);
                }
            }

            var entry = _context.Add(new Registration());
            entry.CurrentValues.SetValues(Input);
            // entry.CurrentValues.SetValues()
            _logger.LogInformation(
                "********************* UserId: " + submitted_user.Id +
                "EventId: " + id
                );

            //Input.EventId = 1; //TODO fix
            //newRegistration.UserId = submitted_user.Id;
            //newRegistration.RegistrationTime = DateTime.Now;
            //newRegistration.RegistrationBy = "Web";

           // await TryUpdateModelAsync<Registration>(
             //    newRegistration, "register",
               //  s => s.EventId,
                // s => s.UserId
               //  );


            var register = await _context.Registrations.AddAsync(newRegistration);
            await _context.SaveChangesAsync();

            //var result = await _userManager.CreateAsync(user, Input.Password);
                

            //_context.Registrations.Add(Registration);
            //await _context.SaveChangesAsync();
            return RedirectToPage("Register/Confirmed");
        }
    }
}