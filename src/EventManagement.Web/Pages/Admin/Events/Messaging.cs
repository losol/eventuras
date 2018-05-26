using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using losol.EventManagement.Services;
using System.ComponentModel.DataAnnotations;
using losol.EventManagement.Web.Services;

namespace losol.EventManagement.Pages.Admin.Events
{
    public class MessagingModel : PageModel
    {
        private readonly IMessageLogService  _messageLogService;
        private readonly IEventInfoService _eventinfos;
        private readonly IRegistrationService _registrationService;
        private readonly RegistrationEmailSender _registrationEmailSender;

        [BindProperty]
        public InputModel Input { get; set; }

        [TempData]
        public string StatusMessage { get; set; }

        public class InputModel
        {
            public string EmailSubject {get; set;}
            public string EmailContent { get; set; }
            public string SmsContent { get; set; }
        }

        public MessagingModel(
            IMessageLogService messageLogService, 
            IEventInfoService eventinfos, 
            IRegistrationService registrationService,
            RegistrationEmailSender registrationEmailSender)
        {
            _messageLogService = messageLogService;
            _eventinfos = eventinfos;
            _registrationService = registrationService;
            _registrationEmailSender = registrationEmailSender;
        }

        public EventInfo EventInfo {get;set;}

        public async Task<IActionResult> OnGetAsync(int id)
        {
            EventInfo = await _eventinfos.GetAsync(id);
            return Page();
        }

        public async Task<IActionResult> OnPostSendEmailAsync(int id) {
            if (!ModelState.IsValid)
            {
                return Page();
            }
            
            
            // StatusMessage = result;
            EventInfo = await _eventinfos.GetAsync(id);
            return RedirectToPage();
        }
        public async Task<IActionResult> OnPostSendSMSAsync(int id) {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            // Do the SMS sending here. 

            StatusMessage = "Sendte SMS";
            EventInfo = await _eventinfos.GetAsync(id);
            return RedirectToPage();
        }

        }
    }

