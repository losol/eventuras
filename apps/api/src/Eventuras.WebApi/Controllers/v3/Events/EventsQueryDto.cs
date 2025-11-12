#nullable enable

using System.ComponentModel.DataAnnotations;
using Eventuras.Domain;
using Eventuras.Services.Events;
using Eventuras.WebApi.Models;
using NodaTime;

namespace Eventuras.WebApi.Controllers.v3.Events;

public class EventsQueryDto : PageQueryDto
{
    public EventInfo.EventInfoType? Type { get; set; }
    public LocalDate? Start { get; set; }
    public LocalDate? End { get; set; }
    public PeriodMatchingKind Period { get; set; } = PeriodMatchingKind.Match;
    public bool IncludePastEvents { get; set; }
    public bool IncludeDraftEvents { get; set; }

    [Range(1, int.MaxValue)] public int? OrganizationId { get; set; }

    [Range(1, int.MaxValue)] public int? CollectionId { get; set; }

    public EventInfoFilter ToEventInfoFilter()
    {
        var filter = new EventInfoFilter
        {
            TypeOneOf = Type.HasValue ? new[] { Type.Value } : null,
            StatusNoneOf = IncludeDraftEvents
                ? null
                : new[] { EventInfo.EventInfoStatus.Draft },
            OrganizationId = OrganizationId,
            CollectionIds = CollectionId.HasValue ? new[] { CollectionId.Value } : null,
            AccessibleOnly = false
        };

        if (!Start.HasValue && !End.HasValue && !IncludePastEvents)
        {
            filter.StartDateAfter = SystemClock.Instance.Today();
        }

        switch (Period)
        {
            case PeriodMatchingKind.Match:
                filter.StartDate = Start;
                filter.EndDate = End;
                break;

            case PeriodMatchingKind.Intersect:
                if (Start.HasValue)
                {
                    filter.StartDateAfter = LocalDate.MinIsoValue; // to ensure event start date is set
                    filter.EndDateIsNullOrAfter = Start;
                }

                if (End.HasValue)
                {
                    filter.StartDateBefore = End;
                }

                break;

            case PeriodMatchingKind.Contain:
                if (Start.HasValue)
                {
                    filter.StartDateAfter = Start;
                    filter.EndDateIsNullOrAfter = Start;
                }

                if (End.HasValue)
                {
                    filter.StartDateBefore = End;
                    filter.EndDateIsNullOrBefore = End;
                }

                break;
        }

        return filter;
    }
}

public enum PeriodMatchingKind
{
    /**
     * Check whether the filter start/end date are equal to the event start/end date.
     */
    Match,

    /**
     * Means to check if the given filter period is at least partially intersecting with event.
     */
    Intersect,

    /**
     * Means to check if the given filter period contains the whole event period.
     */
    Contain
}
