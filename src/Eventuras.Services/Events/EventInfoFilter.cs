using System;
using Eventuras.Domain;

namespace Eventuras.Services.Events
{
    public class EventInfoFilter
    {
        public EventInfo.EventInfoStatus[] StatusOneOf { get; set; }

        public EventInfo.EventInfoStatus[] StatusNoneOf { get; set; }

        public EventInfo.EventInfoType[] TypeOneOf { get; set; }

        public EventInfo.EventInfoType[] TypeNoneOf { get; set; }

        public bool FeaturedOnly { get; set; }

        public bool PastEventsOnly { get; set; }

        public bool TodaysEventsOnly { get; set; }

        public DateTime? StartDateAfter { get; set; }
    }
}
