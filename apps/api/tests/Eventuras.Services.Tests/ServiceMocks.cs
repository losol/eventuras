using System.Linq;
using System.Threading;
using Eventuras.Domain;
using Eventuras.Services.Events;
using Eventuras.Services.Exceptions;
using Moq;

namespace Eventuras.Services.Tests;

public static class ServiceMocks
{
    public static IEventInfoRetrievalService MockEventInfoRetrievalService(out Mock<IEventInfoRetrievalService> mock,
        params EventInfo[] eventInfos)
    {
        mock = new Mock<IEventInfoRetrievalService>();

        mock.Setup(s =>
                s.GetEventInfoByIdAsync(It.IsAny<int>(), It.IsAny<EventInfoRetrievalOptions>(),
                    It.IsAny<CancellationToken>()))
            .ReturnsAsync((int id, EventInfoRetrievalOptions _, CancellationToken _) =>
            {
                var found = eventInfos.FirstOrDefault(ei => ei.EventInfoId == id) ?? throw new NotFoundException();
                return found;
            })
            .Verifiable();

        mock.Setup(s => s.ListEventsAsync(It.IsAny<EventListRequest>(), It.IsAny<EventInfoRetrievalOptions>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((EventListRequest request, EventInfoRetrievalOptions _, CancellationToken _) =>
            {
                var query = eventInfos.AsQueryable();
                query = query.UseFilter(request.Filter);
                query = query.UseOrder(request.Ordering);
                return Paging.Create(query, request);
            })
            .Verifiable();

        return mock.Object;
    }
}
