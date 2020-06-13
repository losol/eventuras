using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services;

namespace Eventuras.Pages.Admin.Events
{
    public class MessagingLogModel : PageModel
    {
        private readonly IMessageLogService _messageLogService;
        private readonly IEventInfoService _eventinfos;

        public MessagingLogModel(IMessageLogService messageLogService, IEventInfoService eventinfos)
        {
            _messageLogService = messageLogService;
            _eventinfos = eventinfos;
        }

        public IList<MessageLog> Messages { get; set; }
        public EventInfo EventInfo { get; set; }

        public async Task OnGetAsync(int id)
        {
            Messages = await _messageLogService.Get(id);
            EventInfo = await _eventinfos.GetAsync(id);
        }
    }
}
