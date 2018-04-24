using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using losol.EventManagement.Domain;
using losol.EventManagement.Services;

namespace losol.EventManagement.Pages.Events
{
    public class DetailsModel : PageModel
    {
		private readonly IEventInfoService _eventsService;

        public DetailsModel(IEventInfoService eventsService)
        {
			_eventsService = eventsService;
        }

        public EventInfo EventInfo { get; set; }

        public async Task<IActionResult> OnGetAsync(string slug)
        {
            if (string.IsNullOrWhiteSpace(slug)) return NotFound();

			EventInfo = await _eventsService.GetBySlugAsync(slug);

            if (EventInfo == null)
            {
                return NotFound();
            }

            return Page();
        }
    }
}
