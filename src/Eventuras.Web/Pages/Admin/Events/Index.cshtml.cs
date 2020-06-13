using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services;

namespace Eventuras.Pages.Admin.Events
{
    public class IndexModel : PageModel
    {
        private readonly IEventInfoService _eventInfos;

        public IndexModel(IEventInfoService eventInfos)
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
            UpcomingEvents = await _eventInfos.GetEventsAsync();
            OnlineCourses = await _eventInfos.GetOnDemandEventsAsync();
            PastEvents = await _eventInfos.GetPastEventsAsync();
            OngoingEvents = await _eventInfos.GetOngoingEventsAsync();
            UnpublishedEvents = await _eventInfos.GetUnpublishedEventsAsync();
        }
    }
}