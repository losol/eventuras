#nullable enable

using System;
using System.Linq;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services;
using Eventuras.TestAbstractions;
using Eventuras.WebApi.Controllers.v3.BusinessEvents;
using Eventuras.WebApi.Models;
using NodaTime;
using NodaTime.Serialization.SystemTextJson;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.BusinessEvents;

public class BusinessEventsControllerTest : IClassFixture<CustomWebApiApplicationFactory<Program>>, IDisposable
{
    private static readonly JsonSerializerOptions JsonOptions = CreateJsonOptions();

    private static JsonSerializerOptions CreateJsonOptions()
    {
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            Converters = { new JsonStringEnumConverter() }
        };
        options.ConfigureForNodaTime(DateTimeZoneProviders.Tzdb);
        return options;
    }

    private readonly CustomWebApiApplicationFactory<Program> _factory;

    public BusinessEventsControllerTest(CustomWebApiApplicationFactory<Program> factory)
    {
        _factory = factory ?? throw new ArgumentNullException(nameof(factory));
        Cleanup();
    }

    public void Dispose() => Cleanup();

    private void Cleanup()
    {
        using var scope = _factory.Services.NewTestScope();
        scope.Db.BusinessEvents.RemoveRange(scope.Db.BusinessEvents.ToArray());
        scope.Db.SaveChanges();
    }

    [Fact]
    public async Task List_Should_Require_Auth()
    {
        var client = _factory.CreateClient();
        var subjectUuid = Guid.NewGuid();

        var response = await client.GetAsync(
            $"/v3/business-events?subjectType=order&subjectUuid={subjectUuid}");

        response.CheckUnauthorized();
    }

    [Fact]
    public async Task List_Should_Forbid_Non_Admin()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();

        var client = _factory.CreateClient().AuthenticatedAs(user.Entity);
        var subjectUuid = Guid.NewGuid();

        var response = await client.GetAsync(
            $"/v3/business-events?subjectType=order&subjectUuid={subjectUuid}");

        response.CheckForbidden();
    }

    [Fact]
    public async Task List_Should_Return_Events_Scoped_To_Current_Organization()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var otherOrg = await scope.CreateOrganizationAsync();

        var orderUuid = Guid.NewGuid();
        var sameSubjectOtherOrg = new BusinessEvent
        {
            CreatedAt = Instant.FromUtc(2026, 4, 19, 10, 0),
            EventType = "order.created",
            Message = "Created in other org",
            SubjectType = "order",
            SubjectUuid = orderUuid,
            OrganizationUuid = otherOrg.Entity.Uuid
        };
        var mine = new BusinessEvent
        {
            CreatedAt = Instant.FromUtc(2026, 4, 19, 11, 0),
            EventType = "order.status.changed",
            Message = "Mine",
            SubjectType = "order",
            SubjectUuid = orderUuid,
            OrganizationUuid = org.Entity.Uuid
        };
        scope.Db.BusinessEvents.AddRange(sameSubjectOtherOrg, mine);
        await scope.Db.SaveChangesAsync();

        var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();

        var response = await client.GetAsync(
            $"/v3/business-events?orgId={org.Entity.OrganizationId}&subjectType=order&subjectUuid={orderUuid}");

        var body = await response.CheckOk().Content.ReadFromJsonAsync<PageResponseDto<BusinessEventDto>>(JsonOptions);
        Assert.NotNull(body);
        Assert.Equal(1, body!.Total);
        Assert.Equal("Mine", body.Data[0].Message);
        Assert.Equal(org.Entity.Uuid, body.Data[0].OrganizationUuid);
    }

    [Fact]
    public async Task List_Should_Order_Newest_First()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();

        var orderUuid = Guid.NewGuid();
        var older = new BusinessEvent
        {
            CreatedAt = Instant.FromUtc(2026, 4, 19, 10, 0),
            EventType = "order.created",
            Message = "older",
            SubjectType = "order",
            SubjectUuid = orderUuid,
            OrganizationUuid = org.Entity.Uuid
        };
        var newer = new BusinessEvent
        {
            CreatedAt = Instant.FromUtc(2026, 4, 19, 12, 0),
            EventType = "order.status.changed",
            Message = "newer",
            SubjectType = "order",
            SubjectUuid = orderUuid,
            OrganizationUuid = org.Entity.Uuid
        };
        scope.Db.BusinessEvents.AddRange(older, newer);
        await scope.Db.SaveChangesAsync();

        var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();

        var response = await client.GetAsync(
            $"/v3/business-events?orgId={org.Entity.OrganizationId}&subjectType=order&subjectUuid={orderUuid}");

        var body = await response.CheckOk().Content.ReadFromJsonAsync<PageResponseDto<BusinessEventDto>>(JsonOptions);
        Assert.NotNull(body);
        Assert.Equal(new[] { "newer", "older" }, body!.Data.Select(e => e.Message).ToArray());
    }

    [Fact]
    public async Task List_Should_Require_Subject_Parameters()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();

        var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();

        var response = await client.GetAsync(
            $"/v3/business-events?orgId={org.Entity.OrganizationId}");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
    }
}
