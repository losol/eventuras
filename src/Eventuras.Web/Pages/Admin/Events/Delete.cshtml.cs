using Eventuras.Domain;
using Eventuras.Services.Events;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;
using System.Threading.Tasks;

namespace Eventuras.Pages.Admin.Events
{
    public class DeleteModel : PageModel
    {
        private readonly IEventInfoRetrievalService _eventInfoRetrievalService;
        private readonly IEventManagementService _eventManagementService;

        public DeleteModel(IEventInfoRetrievalService eventInfoRetrievalService, IEventManagementService eventManagementService)
        {
            _eventInfoRetrievalService = eventInfoRetrievalService ?? throw new ArgumentNullException(nameof(eventInfoRetrievalService));
            _eventManagementService = eventManagementService ?? throw new ArgumentNullException(nameof(eventManagementService));
        }

        [BindProperty]
        public EventInfo EventInfo { get; set; }

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            EventInfo = await _eventInfoRetrievalService.GetEventInfoByIdAsync(id.Value);

            if (EventInfo == null)
            {
                return NotFound();
            }
            return Page();
        }

        public async Task<IActionResult> OnPostAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            await _eventManagementService.DeleteEventAsync(id.Value);

            return RedirectToPage("./Index");
        }
    }
}
