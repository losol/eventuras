using System;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.ExternalSync;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Web.Pages.Admin.Sync
{
    public class AddExternalEventModel : PageModel
    {
        private readonly IEventSynchronizationService _eventSynchronizationService;
        private readonly IExternalEventManagementService _externalEventManagementService;
        private readonly ApplicationDbContext _context;

        public AddExternalEventModel(
            IEventSynchronizationService eventSynchronizationService,
            IExternalEventManagementService externalEventManagementService,
            ApplicationDbContext context)
        {
            _eventSynchronizationService = eventSynchronizationService ?? throw new ArgumentNullException(nameof(eventSynchronizationService));
            _externalEventManagementService = externalEventManagementService ?? throw new ArgumentNullException(nameof(externalEventManagementService));
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public string[] ExternalServiceNames => _eventSynchronizationService.SyncProviderNames;

        public EventInfo EventInfo { get; set; }

        [BindProperty]
        public ExternalEventDto ExternalEvent { get; set; }

        public async Task<IActionResult> OnGetAsync(int id)
        {
            EventInfo = await _context.EventInfos.FirstOrDefaultAsync(e => e.EventInfoId == id);
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
