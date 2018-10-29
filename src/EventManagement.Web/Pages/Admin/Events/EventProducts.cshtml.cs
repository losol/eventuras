using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Domain;
using losol.EventManagement.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace losol.EventManagement.Pages.Admin.Events
{
    public class EventProductsModel : PageModel
    {

        public EventInfo EventInfo { get; set; }
        private readonly IEventInfoService _eventsService;

        public EventProductsModel(IEventInfoService eventsService)
        {
            _eventsService = eventsService;
        }

        public async Task<IActionResult> OnGet(int id)
        {
            if (id is 0) return NotFound();
            EventInfo = await _eventsService.GetWithProductsAsync(id);
            return Page();
        }
    }
}
