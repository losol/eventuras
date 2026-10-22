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
using Eventuras.WebApi.Controllers.v3.Privacy;
using NodaTime;
using NodaTime.Serialization.SystemTextJson;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Privacy;

public class ProcessingPurposesControllerTest : IClassFixture<CustomWebApiApplicationFactory<Program>>, IDisposable
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

    public ProcessingPurposesControllerTest(CustomWebApiApplicationFactory<Program> factory)
    {
        _factory = factory ?? throw new ArgumentNullException(nameof(factory));
        Cleanup();
    }

    public void Dispose() => Cleanup();

    private void Cleanup()
    {
        using var scope = _factory.Services.NewTestScope();
        scope.Db.ProcessingPurposes.RemoveRange(scope.Db.ProcessingPurposes.ToArray());
        scope.Db.SaveChanges();
    }

    // Seeded through a scope of their own: the organization's scope must not track
    // them, or disposing the organization trips the restricting foreign key before
    // Cleanup gets to remove them.
    private async Task SeedAsync(params ProcessingPurpose[] purposes)
    {
        using var scope = _factory.Services.NewTestScope();
        scope.Db.ProcessingPurposes.AddRange(purposes);
        await scope.Db.SaveChangesAsync();
    }

    private static ProcessingPurpose Purpose(
        Organization org,
        string code,
        int version = 1,
        Instant? retiredAt = null) => new()
        {
            OrganizationUuid = org.Uuid,
            Code = code,
            Version = version,
            Kind = ProcessingPurpose.PurposeKind.Reservation,
            Name = $"{code} v{version}",
            Text = $"Text for {code} v{version}",
            RetiredAt = retiredAt
        };

    [Fact]
    public async Task List_Should_Require_Auth()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/v3/processing-purposes");

        response.CheckUnauthorized();
    }

    [Fact]
    public async Task List_Should_Reject_When_No_Organization_Can_Be_Resolved()
    {
        var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();

        var response = await client.GetAsync("/v3/processing-purposes");

        response.CheckBadRequest();
    }

    [Fact]
    public async Task List_Should_Return_Current_Versions_Of_The_Current_Organization()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var otherOrg = await scope.CreateOrganizationAsync();

        var retired = Instant.FromUtc(2026, 10, 1, 12, 0);
        await SeedAsync(
            Purpose(org.Entity, "participant-list"),
            Purpose(org.Entity, "newsletter", version: 1, retiredAt: retired),
            Purpose(org.Entity, "newsletter", version: 2),
            Purpose(org.Entity, "photos", retiredAt: retired),
            Purpose(otherOrg.Entity, "marketing"));

        var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();

        var response = await client.GetAsync(
            $"/v3/processing-purposes?orgId={org.Entity.OrganizationId}");

        var body = await response.CheckOk().Content.ReadFromJsonAsync<ProcessingPurposeDto[]>(JsonOptions);
        Assert.NotNull(body);
        Assert.Equal(
            new[] { ("newsletter", 2), ("participant-list", 1) },
            body!.Select(p => (p.Code, p.Version)).ToArray());
        Assert.Equal(ProcessingPurpose.PurposeKind.Reservation, body[0].Kind);
        Assert.Equal("Text for newsletter v2", body[0].Text);
    }

    [Fact]
    public async Task List_Should_Allow_Admin_Of_The_Current_Organization()
    {
        using var scope = _factory.Services.NewTestScope();
        using var admin = await scope.CreateUserAsync(role: Roles.Admin);
        using var org = await scope.CreateOrganizationAsync();
        using var member = await scope
            .CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);

        await SeedAsync(Purpose(org.Entity, "participant-list"));

        var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);

        var response = await client.GetAsync(
            $"/v3/processing-purposes?orgId={org.Entity.OrganizationId}");

        var body = await response.CheckOk().Content.ReadFromJsonAsync<ProcessingPurposeDto[]>(JsonOptions);
        Assert.NotNull(body);
        Assert.Equal("participant-list", Assert.Single(body!).Code);
    }

    [Fact]
    public async Task List_Should_Forbid_Admin_Of_Another_Organization()
    {
        using var scope = _factory.Services.NewTestScope();
        using var adminOfOrgA = await scope.CreateUserAsync(role: Roles.Admin);
        using var orgA = await scope.CreateOrganizationAsync();
        using var orgB = await scope.CreateOrganizationAsync();
        using var member = await scope
            .CreateOrganizationMemberAsync(adminOfOrgA.Entity, orgA.Entity, role: Roles.Admin);

        var client = _factory.CreateClient().AuthenticatedAs(adminOfOrgA.Entity, Roles.Admin);

        var response = await client.GetAsync(
            $"/v3/processing-purposes?orgId={orgB.Entity.OrganizationId}");

        response.CheckForbidden();
    }
}
