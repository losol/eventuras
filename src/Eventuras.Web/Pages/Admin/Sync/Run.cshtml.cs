using System;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Services.ExternalSync;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Eventuras.Web.Pages.Admin.Sync
{
    public class RunModel : PageModel
    {
        private readonly IEventSynchronizationService _eventSynchronizationService;

        public EventSynchronizationResult[] Results { get; private set; }

        public string ServiceProviderName { get; set; }

        public RunModel(IEventSynchronizationService eventSynchronizationService)
        {
            _eventSynchronizationService = eventSynchronizationService ?? throw new ArgumentNullException(nameof(eventSynchronizationService));
        }

        public async Task OnGetAsync(int id, string provider, CancellationToken cancellationToken)
        {
            ServiceProviderName = provider;
            Results = await _eventSynchronizationService.SyncEvent(id, provider, cancellationToken);
        }
    }
}
