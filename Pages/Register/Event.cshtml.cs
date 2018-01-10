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
        

        public EventRegistrationModel(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            ILogger<LoginModel> logger,
            IEmailSender emailSender,
            IOptions<AppSettings> appSettings,
            IHostingEnvironment env)  
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
            _emailSender = emailSender;
            _appSettings = appSettings.Value;
            _env = env;
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
            
            // NEW EMAIL WITH TEMPLATE START
            var webRoot = _env.WebRootPath; //get wwwroot Folder
            var templatePath = _env.WebRootPath  
                + Path.DirectorySeparatorChar.ToString()  
                + "Templates"  
                + Path.DirectorySeparatorChar.ToString()  
                + "Email"  
                + Path.DirectorySeparatorChar.ToString()  
                + "Confirm_Registration.html"; 
            
            
            var builder = new BodyBuilder();
            using (StreamReader SourceReader = System.IO.File.OpenText(templatePath))
            {
            builder.HtmlBody = SourceReader.ReadToEnd();
            }

            /*  Navn: {0}
                Epost: {1}
                Mobil: {2}
                Arbeidsgiver: {3}
                Orgnr: {4}
                Betaling: {5}
                Arrangement: {6}
                CallBackUrl: {7}
            */
            string subject = "Bekreft påmelding på kurs";
            string messageBody = builder.HtmlBody;/* string.Format(builder.HtmlBody,   
                        Registration.Name,  
                        String.Format("{0:dddd, d MMMM yyyy}", DateTime.Now),  
                        Registration.Email,   
                        Registration.Email,   
                        "passordet hemmelig",   
                        "En beskjed her",  
                        "Arrangement",
                        "https://callbackurl"
                        ); */

            await _emailSender.SendEmailAsync(Registration.Email, subject, messageBody);  
            
            // NEW EMAIL WITH TEMPLATE END

            /* string message = string.Format(
            @"Navn: {0}
            Epost: {1}
            Mobil: {2}
            Arbeidsgiver: {3}
            Orgnr: {4}
            Betaling: {5}
            Arrangement: {6} {7}
            ",
            Registration.Name,
            Registration.Email,
            Registration.Phone,
            Registration.Employer,
            Registration.VatNumber,
            Registration.PaymentMethodId,
            Registration.EventInfoId,
            Registration.EventInfoTitle
            );

            await _emailSender.SendEmailAsync("losvik@gmail.com","kursinord.no notifikasjon", message);
            */ 
            return RedirectToPage("/Register/Confirmed");
        }
    }
}