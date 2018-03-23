using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using losol.EventManagement.Services;

namespace losol.EventManagement.Pages.Admin.Events
{
    public class CreateModel : PageModel
    {
        private readonly IEventInfoService _eventsService;

		public CreateModel(IEventInfoService eventsService)
        {
			_eventsService = eventsService;
        }

        public IActionResult OnGet()
        {
            return Page();
        }

        [BindProperty]
        public EventInfo EventInfo { get; set; }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

			await _eventsService.AddAsync(EventInfo);

            return RedirectToPage("./Index");
        }

        public async Task<IActionResult> OnPostSaveAndEditAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

			var eventId = await _eventsService.AddAsync(EventInfo);
            Console.WriteLine("************************ " + EventInfo.EventInfoId + "," + eventId);
            return RedirectToPage("./Edit", new {id=EventInfo.EventInfoId});
        }
    }
}