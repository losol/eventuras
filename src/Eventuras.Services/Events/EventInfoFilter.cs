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

        public bool IncludeArchived { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public DateTime? StartDateBefore { get; set; }

        public DateTime? StartDateAfter { get; set; }

        public DateTime? EndDateIsNullOrBefore { get; set; }

        public DateTime? EndDateIsNullOrAfter { get; set; }

        public DateTime? EndDateBefore { get; set; }

        public DateTime? EndDateAfter { get; set; }

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
            StartDateBefore = copy.StartDateBefore;
            StartDateAfter = copy.StartDateAfter;
            EndDateBefore = copy.EndDateBefore;
            EndDateAfter = copy.EndDateAfter;
            CollectionIds = copy.CollectionIds;
        }

        public override string ToString()
        {
            return $"{nameof(StatusOneOf)}: {StatusOneOf},\n" +
                   $"{nameof(StatusNoneOf)}: {StatusNoneOf},\n" +
                   $"{nameof(TypeOneOf)}: {TypeOneOf},\n" +
                   $"{nameof(TypeNoneOf)}: {TypeNoneOf},\n" +
                   $"{nameof(FeaturedOnly)}: {FeaturedOnly},\n" +
                   $"{nameof(PastEventsOnly)}: {PastEventsOnly},\n" +
                   $"{nameof(TodaysEventsOnly)}: {TodaysEventsOnly},\n" +
                   $"{nameof(AccessibleOnly)}: {AccessibleOnly},\n" +
                   $"{nameof(StartDateBefore)}: {StartDateBefore},\n" +
                   $"{nameof(StartDateAfter)}: {StartDateAfter},\n" +
                   $"{nameof(EndDateIsNullOrBefore)}: {EndDateIsNullOrBefore},\n" +
                   $"{nameof(EndDateIsNullOrAfter)}: {EndDateIsNullOrAfter},\n" +
                   $"{nameof(EndDateBefore)}: {EndDateBefore},\n" +
                   $"{nameof(EndDateAfter)}: {EndDateAfter},\n" +
                   $"{nameof(CollectionIds)}: {CollectionIds}";
        }

        public static EventInfoFilter UpcomingEvents(EventInfoFilter filter = null)
        {
            return new EventInfoFilter(filter ?? new EventInfoFilter())
            {
                StatusNoneOf = new[]
                {
                    EventInfo.EventInfoStatus.Draft
                },
                StartDateAfter = DateTime.Now
            };
        }

        public static EventInfoFilter FeaturedEvents(EventInfoFilter filter = null)
        {
            return new EventInfoFilter(filter ?? new EventInfoFilter())
            {
                FeaturedOnly = true,
                StatusNoneOf = new[]
                {
                    EventInfo.EventInfoStatus.Cancelled,
                    EventInfo.EventInfoStatus.Draft
                },
                StartDateAfter = DateTime.Now
            };
        }

        public static EventInfoFilter UnpublishedEvents(EventInfoFilter filter = null)
        {
            return new EventInfoFilter(filter ?? new EventInfoFilter())
            {
                StatusOneOf = new[]
                {
                    EventInfo.EventInfoStatus.Cancelled,
                    EventInfo.EventInfoStatus.Draft
                }
            };
        }

        public static EventInfoFilter PastEvents(EventInfoFilter filter = null)
        {
            return new EventInfoFilter(filter ?? new EventInfoFilter())
            {
                PastEventsOnly = true,
                StatusNoneOf = new[]
                {
                    EventInfo.EventInfoStatus.Cancelled,
                    EventInfo.EventInfoStatus.Draft
                }
            };
        }

        public static EventInfoFilter OnDemandEvents(EventInfoFilter filter = null)
        {
            return new EventInfoFilter(filter ?? new EventInfoFilter())
            {
                StatusNoneOf = new[]
                {
                    EventInfo.EventInfoStatus.Cancelled,
                    EventInfo.EventInfoStatus.Draft
                },
                TypeOneOf = new[]
                {
                    EventInfo.EventInfoType.OnlineCourse
                }
            };
        }

        public static EventInfoFilter OngoingEvents(EventInfoFilter filter = null)
        {
            return new EventInfoFilter(filter ?? new EventInfoFilter())
            {
                TodaysEventsOnly = true,
                StatusNoneOf = new[]
                {
                    EventInfo.EventInfoStatus.Cancelled,
                    EventInfo.EventInfoStatus.Draft
                }
            };
        }
    }
}
