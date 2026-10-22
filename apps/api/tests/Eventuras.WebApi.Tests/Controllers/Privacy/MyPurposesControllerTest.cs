#nullable enable

using System;
using System.Linq;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Privacy;
using Eventuras.TestAbstractions;
using Eventuras.WebApi.Controllers.v3.Privacy;
using NodaTime;
using NodaTime.Serialization.SystemTextJson;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Privacy;

public class MyPurposesControllerTest : IClassFixture<CustomWebApiApplicationFactory<Program>>, IDisposable
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

    public MyPurposesControllerTest(CustomWebApiApplicationFactory<Program> factory)
    {
        _factory = factory ?? throw new ArgumentNullException(nameof(factory));
        Cleanup();
    }

    public void Dispose() => Cleanup();

    private void Cleanup()
    {
        using var scope = _factory.Services.NewTestScope();
        scope.Db.PurposeDecisions.RemoveRange(scope.Db.PurposeDecisions.ToArray());
        scope.Db.ProcessingPurposes.RemoveRange(scope.Db.ProcessingPurposes.ToArray());
        scope.Db.BusinessEvents.RemoveRange(scope.Db.BusinessEvents.ToArray());
        scope.Db.SaveChanges();
    }

    // Seeded through a scope of their own, so the organization's scope never tracks
    // them and disposing the organization does not trip the restricting foreign key.
    private async Task SeedAsync(params ProcessingPurpose[] purposes)
    {
        using var scope = _factory.Services.NewTestScope();
        scope.Db.ProcessingPurposes.AddRange(purposes);
        await scope.Db.SaveChangesAsync();
    }

    private static ProcessingPurpose Purpose(
        Organization org,
        string code,
        ProcessingPurpose.PurposeKind kind = ProcessingPurpose.PurposeKind.Reservation,
        int version = 1,
        Instant? retiredAt = null) => new()
        {
            OrganizationUuid = org.Uuid,
            Code = code,
            Version = version,
            Kind = kind,
            Name = code,
            Text = $"Text for {code}",
            RetiredAt = retiredAt
        };

    private static string Url(Organization org, string? code = null) =>
        code is null
            ? $"/v3/userprofile/purposes?orgId={org.OrganizationId}"
            : $"/v3/userprofile/purposes/{code}?orgId={org.OrganizationId}";

    [Fact]
    public async Task List_Should_Require_Auth()
    {
        var response = await _factory.CreateClient().GetAsync("/v3/userprofile/purposes");

        response.CheckUnauthorized();
    }

    [Fact]
    public async Task List_Should_Allow_An_Unanswered_Reservation_But_Not_An_Unanswered_Consent()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var org = await scope.CreateOrganizationAsync();
        await SeedAsync(
            Purpose(org.Entity, PurposeCodes.MarketingNewsletter),
            Purpose(org.Entity, "photos", ProcessingPurpose.PurposeKind.Consent),
            Purpose(org.Entity, "retired", retiredAt: Instant.FromUtc(2026, 10, 1, 12, 0)));

        var client = _factory.CreateClient().AuthenticatedAs(user.Entity);

        var body = await (await client.GetAsync(Url(org.Entity)))
            .CheckOk().Content.ReadFromJsonAsync<MyPurposeDto[]>(JsonOptions);

        Assert.NotNull(body);
        Assert.Equal(new[] { PurposeCodes.MarketingNewsletter, "photos" }, body!.Select(p => p.Purpose.Code));

        var newsletter = body[0];
        Assert.Equal(PurposeStatus.Unanswered, newsletter.Status);
        Assert.True(newsletter.MayProcess);
        Assert.False(newsletter.MustAsk);
        Assert.Null(newsletter.Decision);

        var photos = body[1];
        Assert.Equal(PurposeStatus.Unanswered, photos.Status);
        Assert.False(photos.MayProcess);
        Assert.True(photos.MustAsk);
    }

    [Fact]
    public async Task Decide_Should_Reserve_Against_Marketing_And_Log_It()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var org = await scope.CreateOrganizationAsync();
        await SeedAsync(Purpose(org.Entity, PurposeCodes.MarketingNewsletter));

        var client = _factory.CreateClient().AuthenticatedAs(user.Entity);

        var decided = await (await client.PutAsJsonAsync(
                Url(org.Entity, PurposeCodes.MarketingNewsletter), new { decision = "Denied" }))
            .CheckOk().Content.ReadFromJsonAsync<MyPurposeDto>(JsonOptions);

        Assert.NotNull(decided);
        Assert.Equal(PurposeStatus.Denied, decided!.Status);
        Assert.False(decided.MayProcess);
        Assert.Equal(PurposeDecision.DecisionValue.Denied, decided.Decision);

        var listed = await (await client.GetAsync(Url(org.Entity)))
            .CheckOk().Content.ReadFromJsonAsync<MyPurposeDto[]>(JsonOptions);
        Assert.False(Assert.Single(listed!).MayProcess);

        using var check = _factory.Services.NewTestScope();
        var stored = Assert.Single(check.Db.PurposeDecisions.ToArray());
        Assert.Equal(user.Entity.Id, stored.UserId);
        Assert.Null(stored.RegistrationUuid);
        Assert.Equal("userprofile", stored.Source);

        var logged = Assert.Single(check.Db.BusinessEvents.ToArray());
        Assert.Equal("purpose.decision.changed", logged.EventType);
        Assert.Equal(BusinessEventSubjects.UserType, logged.SubjectType);
        Assert.Equal(user.Entity.Id, logged.SubjectUuid);
        Assert.Equal(org.Entity.Uuid, logged.OrganizationUuid);
    }

    [Fact]
    public async Task Decide_Should_Update_The_Same_Decision_And_Log_Only_Changes()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var org = await scope.CreateOrganizationAsync();
        await SeedAsync(Purpose(org.Entity, PurposeCodes.MarketingNewsletter));

        var client = _factory.CreateClient().AuthenticatedAs(user.Entity);
        var url = Url(org.Entity, PurposeCodes.MarketingNewsletter);

        (await client.PutAsJsonAsync(url, new { decision = "Denied" })).CheckOk();
        (await client.PutAsJsonAsync(url, new { decision = "Allowed" })).CheckOk();
        var last = await (await client.PutAsJsonAsync(url, new { decision = "Allowed" }))
            .CheckOk().Content.ReadFromJsonAsync<MyPurposeDto>(JsonOptions);

        Assert.True(last!.MayProcess);

        using var check = _factory.Services.NewTestScope();
        Assert.Equal(PurposeDecision.DecisionValue.Allowed, Assert.Single(check.Db.PurposeDecisions.ToArray()).Decision);
        Assert.Equal(2, check.Db.BusinessEvents.Count());
    }

    [Fact]
    public async Task Decide_Should_Not_See_Or_Touch_Another_Users_Decision()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var other = await scope.CreateUserAsync();
        using var org = await scope.CreateOrganizationAsync();
        await SeedAsync(Purpose(org.Entity, PurposeCodes.MarketingNewsletter));

        (await _factory.CreateClient().AuthenticatedAs(other.Entity)
            .PutAsJsonAsync(Url(org.Entity, PurposeCodes.MarketingNewsletter), new { decision = "Denied" })).CheckOk();

        var mine = await (await _factory.CreateClient().AuthenticatedAs(user.Entity).GetAsync(Url(org.Entity)))
            .CheckOk().Content.ReadFromJsonAsync<MyPurposeDto[]>(JsonOptions);

        var newsletter = Assert.Single(mine!);
        Assert.Equal(PurposeStatus.Unanswered, newsletter.Status);
        Assert.True(newsletter.MayProcess);
    }

    [Theory]
    [InlineData("unknown")]
    [InlineData("retired")]
    public async Task Decide_Should_Return_Not_Found_Without_A_Current_Purpose(string code)
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var org = await scope.CreateOrganizationAsync();
        await SeedAsync(Purpose(org.Entity, "retired", retiredAt: Instant.FromUtc(2026, 10, 1, 12, 0)));

        var response = await _factory.CreateClient().AuthenticatedAs(user.Entity)
            .PutAsJsonAsync(Url(org.Entity, code), new { decision = "Denied" });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Decide_Should_Reject_A_Missing_Decision()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var org = await scope.CreateOrganizationAsync();
        await SeedAsync(Purpose(org.Entity, PurposeCodes.MarketingNewsletter));

        var response = await _factory.CreateClient().AuthenticatedAs(user.Entity)
            .PutAsJsonAsync(Url(org.Entity, PurposeCodes.MarketingNewsletter), new { });

        response.CheckBadRequest();
    }
}
