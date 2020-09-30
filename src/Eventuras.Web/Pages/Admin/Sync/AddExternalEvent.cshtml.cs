using Eventuras.Domain;
using Eventuras.Services.Events;
using Eventuras.Services.ExternalSync;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace Eventuras.Web.Pages.Admin.Sync
{
    public class AddExternalEventModel : PageModel
    {
        private readonly IEventSynchronizationService _eventSynchronizationService;
        private readonly IEventInfoRetrievalService _eventInfoRetrievalService;
        private readonly IExternalEventManagementService _externalEventManagementService;

        public AddExternalEventModel(
            IEventSynchronizationService eventSynchronizationService,
            IEventInfoRetrievalService eventInfoRetrievalService,
            IExternalEventManagementService externalEventManagementService)
        {
            _eventSynchronizationService = eventSynchronizationService ?? throw new ArgumentNullException(nameof(eventSynchronizationService));
            _eventInfoRetrievalService = eventInfoRetrievalService ?? throw new ArgumentNullException(nameof(eventInfoRetrievalService));
            _externalEventManagementService = externalEventManagementService ?? throw new ArgumentNullException(nameof(externalEventManagementService));
        }

        public string[] ExternalServiceNames => _eventSynchronizationService.SyncProviderNames;

        public EventInfo EventInfo { get; set; }

        [BindProperty]
        public ExternalEventDto ExternalEvent { get; set; }

        public async Task<IActionResult> OnGetAsync(int id)
        {
            EventInfo = await _eventInfoRetrievalService.GetEventInfoByIdAsync(id);
            if (EventInfo == null)
            {
                return NotFound();
            }
            return Page();
        }

        public async Task<IActionResult> OnPostAsync(int id)
        {
            try
            {
                await _externalEventManagementService.CreateNewExternalEventAsync(id,
                    ExternalEvent.ExternalServiceName,
                    ExternalEvent.ExternalEventId);
            }
            catch (DuplicateExternalEventException e)
            {
                ModelState.AddModelError(string.Empty, e.Message);
                return await OnGetAsync(id);
            }

            return RedirectToPage("./Setup", new { id });
        }
    }

    public class ExternalEventDto
    {
        [Required]
        public string ExternalEventId { get; set; }

        [Required]
        public string ExternalServiceName { get; set; }
    }
}
