using System.Collections.Generic;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services;
using Eventuras.Services.Events;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Eventuras.Pages.Admin.Events;

public class MessagingLogModel : PageModel
{
    private readonly IMessageLogService _messageLogService;
    private readonly IEventInfoRetrievalService _eventinfos;

    public MessagingLogModel(IMessageLogService messageLogService, IEventInfoRetrievalService eventinfos)
    {
        _messageLogService = messageLogService;
        _eventinfos = eventinfos;
    }

    public IList<MessageLog> Messages { get; set; }

    public EventInfo EventInfo { get; set; }

    public async Task OnGetAsync(int id)
    {
        Messages = await _messageLogService.Get(id);
        EventInfo = await _eventinfos.GetEventInfoByIdAsync(id);
    }
}