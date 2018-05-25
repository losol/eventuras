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

namespace losol.EventManagement.Pages.Admin.Events
{
    public class MessagingModel : PageModel
    {
        private readonly IMessageLogService  _messageLogService;
        private readonly IEventInfoService _eventinfos;

        [BindProperty]
        public InputModel Input { get; set; }

        [TempData]
        public string ErrorMessage { get; set; }

        public class InputModel
        {
            public string EmailSubject {get; set;}
            public string EmailContent { get; set; }
            public string SmsContent { get; set; }
        }

        public MessagingModel(IMessageLogService messageLogService, IEventInfoService eventinfos)
        {
            _messageLogService = messageLogService;
            _eventinfos = eventinfos;
        }

        public EventInfo EventInfo {get;set;}

        public async Task OnGetAsync(int id)
        {
            EventInfo = await _eventinfos.GetAsync(id);
        }
    }
}
