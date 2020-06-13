using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services;

namespace Eventuras.Pages.Admin.Events
{
    public class EditModel : PageModel
    {
        private readonly IEventInfoService _eventsService;

        public EditModel(IEventInfoService eventsService)
        {
            _eventsService = eventsService;
        }

        [BindProperty]
        public EventInfo EventInfo { get; set; }

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            EventInfo = await _eventsService.GetWithProductsAsync(id.Value);

            if (EventInfo == null)
            {
                return NotFound();
            }
            return Page();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            await _eventsService.UpdateEventWithProductsAsync(EventInfo);

            return RedirectToPage("./Index");
        }

        public async Task<IActionResult> OnPostSaveAndEditProductsAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            return RedirectToPage("./Products", new { id = EventInfo.EventInfoId });
        }
    }
}
