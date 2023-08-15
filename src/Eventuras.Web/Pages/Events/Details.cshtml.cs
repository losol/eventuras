using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Events;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Eventuras.Pages.Events;

public class DetailsModel : PageModel
{
    private readonly IEventInfoRetrievalService _eventsService;

    public DetailsModel(IEventInfoRetrievalService eventsService)
    {
        _eventsService = eventsService;
    }

    public EventInfo EventInfo { get; set; }

    public async Task<IActionResult> OnGetAsync(int id, string slug)
    {
        EventInfo = await _eventsService.GetEventInfoByIdAsync(id,
            new EventInfoRetrievalOptions
            {
                LoadProducts = true,
            });

        if (EventInfo == null) return NotFound();

        if (EventInfo.Slug != slug) return RedirectToPage("./Details", new { id, slug = EventInfo.Slug });

        return Page();
    }
}