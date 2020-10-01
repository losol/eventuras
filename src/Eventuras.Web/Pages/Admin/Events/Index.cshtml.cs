using System.Collections.Generic;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services;
using Eventuras.Services.Events;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Eventuras.Web.Pages.Admin.Events
{
    public class IndexModel : PageModel
    {
        private readonly IEventInfoRetrievalService _eventInfos;

        public IndexModel(IEventInfoRetrievalService eventInfos)
        {
            _eventInfos = eventInfos;
        }

        public IList<EventInfo> UpcomingEvents { get; set; }
        public IList<EventInfo> OnlineCourses { get; set; }
        public IList<EventInfo> PastEvents { get; set; }
        public IList<EventInfo> OngoingEvents { get; set; }
        public IList<EventInfo> UnpublishedEvents { get; set; }


        public async Task OnGetAsync()
        {
            UpcomingEvents = await _eventInfos.GetUpcomingEventsAsync();
            OnlineCourses = await _eventInfos.GetOnDemandEventsAsync();
            PastEvents = await _eventInfos.GetPastEventsAsync();
            OngoingEvents = await _eventInfos.GetOngoingEventsAsync();
            UnpublishedEvents = await _eventInfos.GetUnpublishedEventsAsync();
        }
    }
}