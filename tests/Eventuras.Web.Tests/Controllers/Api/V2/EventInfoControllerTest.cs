using System.Net;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.IntegrationTests;
using Eventuras.TestAbstractions;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json.Linq;
using NodaTime;
using Xunit;

namespace Eventuras.Web.Tests.Controllers.Api.V2;

public class EventInfoControllerTest : IClassFixture<CustomWebApplicationFactory<Startup>>
{
    private readonly CustomWebApplicationFactory<Startup> _factory;

    public EventInfoControllerTest(CustomWebApplicationFactory<Startup> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Should_Return_Empty_Event_List()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/v2/events");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        JArray.Parse(content).CheckEmptyArray();
    }

    [Fact(Skip = "Use tests for v3.")]
    public async Task Should_List_Upcoming_Events()
    {
        var client = _factory.CreateClient();

        using var scope = _factory.Services.NewTestScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        using var pastEvent = await scope.CreateEventAsync(dateStart: SystemClock.Instance.Today().PlusDays(-1));
        using var e1 = await scope.CreateEventAsync(dateStart: SystemClock.Instance.Today().PlusDays(1));
        using var e2 = await scope.CreateEventAsync(dateStart: SystemClock.Instance.Today().PlusDays(2));

        var response = await client.GetAsync("/api/v2/events");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        JArray.Parse(content).CheckArray((token, e) => token.CheckEvent(e), e1.Entity, e2.Entity);
    }

    [Fact(Skip = "Use test for v3.")]
    public async Task List_Events_Should_Support_Collection_Query_Param()
    {
        var client = _factory.CreateClient();

        using var scope = _factory.Services.NewTestScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        using var collection = await scope.CreateEventCollectionAsync();
        using var otherCollection = await scope.CreateEventCollectionAsync();
        using var noCollectionEvent = await scope.CreateEventAsync(dateStart: SystemClock.Instance.Today().PlusDays(1));
        using var e1 = await scope.CreateEventAsync(collection: collection.Entity, dateStart: SystemClock.Instance.Today().PlusDays(1));
        using var e2 = await scope.CreateEventAsync(collections: new[]
            {
                collection.Entity,
                otherCollection.Entity,
            },
            dateStart: SystemClock.Instance.Today().PlusDays(2));

        var response = await client.GetAsync($"/api/v2/events?collection={collection.Entity.CollectionId}");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        JArray.Parse(content).CheckArray((token, e) => token.CheckEvent(e), e1.Entity, e2.Entity);

        response = await client.GetAsync($"/api/v2/events?collection={otherCollection.Entity.CollectionId}");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        content = await response.Content.ReadAsStringAsync();
        JArray.Parse(content).CheckArray((token, e) => token.CheckEvent(e), e2.Entity);
    }
}