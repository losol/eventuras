using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services;
using Eventuras.Services.Events;
using Eventuras.Services.Organizations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Eventuras.Web.Pages.Admin.Events
{
    public class CreateModel : PageModel
    {
        private readonly IEventManagementService _eventsService;
        private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;

        public CreateModel(
            IEventManagementService eventsService,
            ICurrentOrganizationAccessorService currentOrganizationAccessorService)
        {
            _eventsService = eventsService;
            _currentOrganizationAccessorService = currentOrganizationAccessorService;
        }

        public async Task<IActionResult> OnGet()
        {
            return await PageAsync();
        }

        [BindProperty]
        public EventInfo EventInfo { get; set; }

        public Organization Organization { get; set; }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return await PageAsync();
            }

            if (!User.IsInRole(Roles.SuperAdmin))
            {
                // Force current org id to be set by all admins except
                // super admin who can choose not to bind event to the org.
                EventInfo.OrganizationId = (await _currentOrganizationAccessorService
                        .RequireCurrentOrganizationAsync())
                    .OrganizationId;
            }

            await _eventsService.CreateNewEventAsync(EventInfo);

            return RedirectToPage("./Index");
        }

        public async Task<IActionResult> OnPostSaveAndEditAsync()
        {
            if (!ModelState.IsValid)
            {
                return await PageAsync();
            }

            await _eventsService.CreateNewEventAsync(EventInfo);
            return RedirectToPage("./Edit", new { id = EventInfo.EventInfoId });
        }

        private async Task<IActionResult> PageAsync()
        {
            Organization = await _currentOrganizationAccessorService.GetCurrentOrganizationAsync(new OrganizationRetrievalOptions
            {
                LoadHostnames = true
            });

            if (EventInfo == null)
            {
                EventInfo = new EventInfo
                {
                    OrganizationId = Organization?.OrganizationId
                };
            }

            return Page();
        }
    }
}