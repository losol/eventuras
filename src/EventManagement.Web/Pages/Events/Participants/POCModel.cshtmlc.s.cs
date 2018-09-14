using System.Threading.Tasks;
using losol.EventManagement.Domain;
using losol.EventManagement.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace losol.EventManagement.Pages.Events.Participants
{
    [Authorize]
    public class POCModel : PageModel
    {
        public string Slug { get; private set; }
        public EventInfo EventInfo { get; private set; }
        private readonly IAuthorizationService _authService;
        private readonly IEventInfoService _eventsService;

        public POCModel(IAuthorizationService authService,
                        IEventInfoService eventsService)
        {
            _authService = authService;
            _eventsService = eventsService;
        }

        public async Task<IActionResult> OnGetAsync(int id, string slug)
        {
            this.Slug = slug;

            EventInfo = await _eventsService.GetWithProductsAsync(id);

            if (EventInfo == null)
            {
                return NotFound();
            }

            if(EventInfo.Code != slug)
            {
                return RedirectToPage("./POC", new { id, slug = EventInfo.Code });
            }

            var authResult = await _authService.AuthorizeAsync(User, EventInfo, policyName: "EventStaffPolicy");

            if(!authResult.Succeeded)
            {
                return new ForbidResult();
            }

            return Page();
        }
    }
}
