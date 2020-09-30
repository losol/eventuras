using System;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services;
using Eventuras.Services.Events;
using Eventuras.Services.Organizations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Eventuras.Web.Pages.Admin.Events
{
    public class EditModel : PageModel
    {
        private readonly IEventManagementService _eventsService;
        private readonly IEventInfoRetrievalService _eventInfoRetrievalService;
        private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;

        public EditModel(
            IEventManagementService eventsService,
            IEventInfoRetrievalService eventInfoRetrievalService,
            ICurrentOrganizationAccessorService currentOrganizationAccessorService)
        {
            _eventsService = eventsService;
            _eventInfoRetrievalService = eventInfoRetrievalService;
            _currentOrganizationAccessorService = currentOrganizationAccessorService;
        }

        [BindProperty]
        public EventInfo EventInfo { get; set; }

        public Organization Organization { get; set; }

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            try
            {
                EventInfo = await _eventInfoRetrievalService.GetEventInfoByIdAsync(id.Value,
                    new EventInfoRetrievalOptions
                    {
                        LoadProducts = true
                    });
            }
            catch (InvalidOperationException)
            {
                return NotFound();
            }

            return await PageAsync();
        }

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

            await _eventsService.UpdateEventAsync(EventInfo);

            return RedirectToPage("./Index");
        }

        public async Task<IActionResult> OnPostSaveAndEditProductsAsync()
        {
            if (!ModelState.IsValid)
            {
                return await PageAsync();
            }

            return RedirectToPage("./Products", new { id = EventInfo.EventInfoId });
        }

        private async Task<IActionResult> PageAsync()
        {
            Organization = await _currentOrganizationAccessorService.GetCurrentOrganizationAsync(new OrganizationRetrievalOptions
            {
                LoadHostnames = true
            });

            return Page();
        }
    }
}
