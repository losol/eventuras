using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services;
using Eventuras.Services.Events;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Moq;
using Xunit;

namespace Eventuras.WebApi.Tests.RateLimiting;

public class AnonymousRateLimitingTests : IClassFixture<CustomWebApiApplicationFactory<Program>>
{
    private readonly CustomWebApiApplicationFactory<Program> _factory;

    public AnonymousRateLimitingTests(CustomWebApiApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Rejects_anonymous_requests_over_the_limit_but_not_authenticated_ones()
    {
        var entered = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var release = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var calls = 0;

        var events = new Mock<IEventInfoRetrievalService>();
        events
            .Setup(s => s.ListEventsAsync(It.IsAny<EventListRequest>(), It.IsAny<EventInfoRetrievalOptions>(),
                It.IsAny<CancellationToken>()))
            .Returns(async () =>
            {
                // Only the first call blocks, holding the single permit.
                if (Interlocked.Increment(ref calls) == 1)
                {
                    entered.SetResult();
                    await release.Task;
                }

                return new Paging<EventInfo>([], 0);
            });

        var factory = _factory.WithWebHostBuilder(b => b
            .UseSetting("RateLimiting:Anonymous:PermitLimit", "1")
            .UseSetting("RateLimiting:Anonymous:QueueLimit", "0")
            .ConfigureTestServices(services =>
            {
                services.RemoveAll<IEventInfoRetrievalService>();
                services.AddSingleton(events.Object);
            }));

        var anonymous = factory.CreateClient();
        var first = anonymous.GetAsync("/v3/events");
        await entered.Task.WaitAsync(TimeSpan.FromSeconds(10));

        var second = await anonymous.GetAsync("/v3/events");
        var authenticated = await factory.CreateClient().Authenticated().GetAsync("/v3/events");

        release.SetResult();

        Assert.Equal(HttpStatusCode.TooManyRequests, second.StatusCode);
        Assert.Equal(TimeSpan.FromSeconds(5), second.Headers.RetryAfter?.Delta);
        Assert.Equal("application/problem+json", second.Content.Headers.ContentType?.MediaType);
        Assert.Equal(HttpStatusCode.OK, authenticated.StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await first).StatusCode);
    }
}
