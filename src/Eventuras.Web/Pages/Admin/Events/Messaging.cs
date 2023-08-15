using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Events;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Eventuras.Pages.Admin.Events;

public class MessagingModel : PageModel
{
    private readonly IEventInfoRetrievalService _eventinfos;

    public MessagingModel(IEventInfoRetrievalService eventinfos)
    {
        _eventinfos = eventinfos;
    }

    public EventInfo EventInfo { get; set; }

    public async Task<IActionResult> OnGetAsync(int id)
    {
        EventInfo = await _eventinfos.GetEventInfoByIdAsync(id);
        return Page();
    }
}