using Eventuras.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Threading.Tasks;
using Eventuras.Services.Events;

namespace Eventuras.Web.Pages.Admin.Sync
{
    public class SetupModel : PageModel
    {
        private readonly IEventInfoRetrievalService _eventInfoService;

        public SetupModel(IEventInfoRetrievalService eventInfoService)
        {
            _eventInfoService = eventInfoService;
        }

        public EventInfo EventInfo { get; set; }

        public async Task<IActionResult> OnGet(int id)
        {
            EventInfo = await _eventInfoService.GetEventInfoByIdAsync(id);

            if (EventInfo == null)
            {
                return NotFound();
            }

            return Page();
        }
    }
}