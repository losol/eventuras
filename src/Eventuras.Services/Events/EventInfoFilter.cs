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

        public bool AccessibleOnly { get; set; } = true;

        public DateTime? StartDateAfter { get; set; }

        public int[] CollectionIds { get; set; }

        public EventInfoFilter()
        {
        }

        public EventInfoFilter(EventInfoFilter copy)
        {
            if (copy == null)
            {
                throw new ArgumentNullException(nameof(copy));
            }
            StatusNoneOf = copy.StatusNoneOf;
            StatusNoneOf = copy.StatusNoneOf;
            TypeOneOf = copy.TypeOneOf;
            TypeNoneOf = copy.TypeNoneOf;
            FeaturedOnly = copy.FeaturedOnly;
            PastEventsOnly = copy.PastEventsOnly;
            TodaysEventsOnly = copy.TodaysEventsOnly;
            StartDateAfter = copy.StartDateAfter;
            CollectionIds = copy.CollectionIds;
        }
    }
}
