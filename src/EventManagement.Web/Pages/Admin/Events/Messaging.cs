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

namespace losol.EventManagement.Pages.Admin.Events
{
    public class MessagingModel : PageModel
    {
        private readonly IMessageLogService  _messageLogService;
        private readonly IEventInfoService _eventinfos;

        public MessagingModel(IMessageLogService messageLogService, IEventInfoService eventinfos)
        {
            _messageLogService = messageLogService;
            _eventinfos = eventinfos;
        }

        public IList<MessageLog> Messages { get;set; }
        public EventInfo EventInfo {get;set;}

        public async Task OnGetAsync(int id)
        {
            Messages = await _messageLogService.Get(id);
            EventInfo = await _eventinfos.GetAsync(id);
        }
    }
}
