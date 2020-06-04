using losol.EventManagement.Services.Lms;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace losol.EventManagement.Web.Pages.Admin.Events
{
    public class SyncLms : PageModel
    {
        private readonly IEventSynchronizationService _eventSynchronizationService;

        public EventSynchronizationResult Result { get; private set; }

        public SyncLms(IEventSynchronizationService eventSynchronizationService)
        {
            _eventSynchronizationService = eventSynchronizationService ?? throw new ArgumentNullException(nameof(eventSynchronizationService));
        }

        public async Task OnGetAsync(int id, CancellationToken cancellationToken)
        {
            Result = await _eventSynchronizationService.SyncEvent(id, cancellationToken);
        }
    }
}
