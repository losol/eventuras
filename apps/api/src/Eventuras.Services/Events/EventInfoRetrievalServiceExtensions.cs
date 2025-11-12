using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Events;

public static class EventInfoRetrievalServiceExtensions
{
    /// <summary>
    ///     Shortcut for <see cref="IEventInfoRetrievalService.GetEventInfoByIdAsync" />.
    /// </summary>
    public static Task<EventInfo> GetEventInfoByIdAsync(
        this IEventInfoRetrievalService service,
        int id,
        CancellationToken cancellationToken = default) =>
        service.GetEventInfoByIdAsync(id, null, cancellationToken);

    public static async Task<List<EventInfo>> GetAllEventsAsync(
        this IEventInfoRetrievalService service,
        EventInfoFilter filter = null,
        EventInfoRetrievalOptions options = null,
        CancellationToken cancellationToken = default) =>
        (await PageReader<EventInfo>.ReadAllAsync((offset, limit, token) =>
                service.ListEventsAsync(new EventListRequest(offset, limit) { Filter = filter }, options, token),
            cancellationToken))
        .ToList();

    public static async Task<List<EventInfo>> GetUpcomingEventsAsync(
        this IEventInfoRetrievalService service,
        EventInfoFilter filter = null,
        EventInfoRetrievalOptions options = null,
        CancellationToken cancellationToken = default) =>
        (await PageReader<EventInfo>.ReadAllAsync((offset, limit, token) =>
            service.ListEventsAsync(
                new EventListRequest(offset, limit) { Filter = EventInfoFilter.UpcomingEvents(filter) }, options,
                token), cancellationToken))
        .ToList();

    public static async Task<List<EventInfo>> GetFeaturedEventsAsync(
        this IEventInfoRetrievalService service,
        EventInfoFilter filter = null,
        EventInfoRetrievalOptions options = null,
        CancellationToken cancellationToken = default) =>
        (await PageReader<EventInfo>.ReadAllAsync((offset, limit, token) =>
            service.ListEventsAsync(
                new EventListRequest(offset, limit) { Filter = EventInfoFilter.FeaturedEvents(filter) }, options,
                token), cancellationToken))
        .ToList();

    public static async Task<List<EventInfo>> GetUnpublishedEventsAsync(
        this IEventInfoRetrievalService service,
        EventInfoFilter filter = null,
        EventInfoRetrievalOptions options = null,
        CancellationToken cancellationToken = default) =>
        (await PageReader<EventInfo>.ReadAllAsync((offset, limit, token) =>
            service.ListEventsAsync(
                new EventListRequest(offset, limit) { Filter = EventInfoFilter.UnpublishedEvents(filter) }, options,
                token), cancellationToken))
        .ToList();

    public static async Task<List<EventInfo>> GetPastEventsAsync(
        this IEventInfoRetrievalService service,
        EventInfoFilter filter = null,
        EventInfoRetrievalOptions options = null,
        CancellationToken cancellationToken = default) =>
        (await PageReader<EventInfo>.ReadAllAsync((offset, limit, token) =>
            service.ListEventsAsync(new EventListRequest(offset, limit) { Filter = EventInfoFilter.PastEvents(filter) },
                options, token), cancellationToken))
        .ToList();

    public static async Task<List<EventInfo>> GetOnDemandEventsAsync(
        this IEventInfoRetrievalService service,
        EventInfoFilter filter = null,
        EventInfoRetrievalOptions options = null,
        CancellationToken cancellationToken = default) =>
        (await PageReader<EventInfo>.ReadAllAsync((offset, limit, token) =>
            service.ListEventsAsync(
                new EventListRequest(offset, limit)
                {
                    Filter = EventInfoFilter.OnDemandEvents(filter),
                    Ordering = new[] { "title:asc" }
                }, options, token), cancellationToken))
        .ToList();

    public static async Task<List<EventInfo>> GetOngoingEventsAsync(
        this IEventInfoRetrievalService service,
        EventInfoFilter filter = null,
        EventInfoRetrievalOptions options = null,
        CancellationToken cancellationToken = default) =>
        (await PageReader<EventInfo>.ReadAllAsync((offset, limit, token) =>
                service.ListEventsAsync(
                    new EventListRequest(offset, limit) { Filter = EventInfoFilter.OngoingEvents(filter) }, options,
                    token),
            cancellationToken))
        .ToList();
}
