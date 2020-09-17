using Eventuras.Domain;
using Eventuras.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Threading.Tasks;

namespace Eventuras.Web.Pages.Admin.Sync
{
    public class SetupModel : PageModel
    {
        private readonly IEventInfoService _eventInfoService;

        public SetupModel(IEventInfoService eventInfoService)
        {
            _eventInfoService = eventInfoService;
        }

        public EventInfo EventInfo { get; set; }

        public async Task<IActionResult> OnGet(int id)
        {
            EventInfo = await _eventInfoService.GetAsync(id);

            if (EventInfo == null)
            {
                return NotFound();
            }

            return Page();
        }
    }
}