using System;
using Eventuras.Domain;
using NodaTime;

namespace Eventuras.Services.Events;

public class EventInfoFilter
{
    public EventInfoFilter()
    {
    }

    public EventInfoFilter(EventInfoFilter copy)
    {
        if (copy == null)
        {
            throw new ArgumentNullException(nameof(copy));
        }

        AccessibleOnly = copy.AccessibleOnly;
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
        OrganizationId = copy.OrganizationId;
    }

    public EventInfo.EventInfoStatus[] StatusOneOf { get; set; }

    public EventInfo.EventInfoStatus[] StatusNoneOf { get; set; }

    public EventInfo.EventInfoType[] TypeOneOf { get; set; }

    public EventInfo.EventInfoType[] TypeNoneOf { get; set; }

    public bool FeaturedOnly { get; set; }

    public bool PastEventsOnly { get; set; }

    public bool TodaysEventsOnly { get; set; }

    public bool AccessibleOnly { get; set; } = true;

    public bool IncludeArchived { get; set; }

    public LocalDate? StartDate { get; set; }

    public LocalDate? EndDate { get; set; }

    public LocalDate? StartDateBefore { get; set; }

    public LocalDate? StartDateAfter { get; set; }

    public LocalDate? EndDateIsNullOrBefore { get; set; }

    public LocalDate? EndDateIsNullOrAfter { get; set; }

    public LocalDate? EndDateBefore { get; set; }

    public LocalDate? EndDateAfter { get; set; }

    public int[] CollectionIds { get; set; }

    public int? OrganizationId { get; set; }

    public override string ToString() =>
        $"{nameof(StatusOneOf)}: {StatusOneOf},\n" +
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
        $"{nameof(CollectionIds)}: {CollectionIds}\n" +
        $"{nameof(OrganizationId)}: {OrganizationId}";

    public static EventInfoFilter UpcomingEvents(EventInfoFilter filter = null) =>
        new(filter ?? new EventInfoFilter())
        {
            StatusNoneOf = new[] { EventInfo.EventInfoStatus.Draft }, StartDateAfter = SystemClock.Instance.Today()
        };

    public static EventInfoFilter FeaturedEvents(EventInfoFilter filter = null) =>
        new(filter ?? new EventInfoFilter())
        {
            FeaturedOnly = true,
            StatusNoneOf = new[] { EventInfo.EventInfoStatus.Cancelled, EventInfo.EventInfoStatus.Draft },
            StartDateAfter = SystemClock.Instance.Today()
        };

    public static EventInfoFilter UnpublishedEvents(EventInfoFilter filter = null) =>
        new(filter ?? new EventInfoFilter())
        {
            StatusOneOf = new[] { EventInfo.EventInfoStatus.Cancelled, EventInfo.EventInfoStatus.Draft }
        };

    public static EventInfoFilter PastEvents(EventInfoFilter filter = null) =>
        new(filter ?? new EventInfoFilter())
        {
            PastEventsOnly = true,
            StatusNoneOf = new[] { EventInfo.EventInfoStatus.Cancelled, EventInfo.EventInfoStatus.Draft }
        };

    public static EventInfoFilter OnDemandEvents(EventInfoFilter filter = null) =>
        new(filter ?? new EventInfoFilter())
        {
            StatusNoneOf = new[] { EventInfo.EventInfoStatus.Cancelled, EventInfo.EventInfoStatus.Draft },
            TypeOneOf = new[] { EventInfo.EventInfoType.OnlineCourse }
        };

    public static EventInfoFilter OngoingEvents(EventInfoFilter filter = null) =>
        new(filter ?? new EventInfoFilter())
        {
            TodaysEventsOnly = true,
            StatusNoneOf = new[] { EventInfo.EventInfoStatus.Cancelled, EventInfo.EventInfoStatus.Draft }
        };
}
