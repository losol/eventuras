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

    private static object NewPurposeBody(
        string code = "marketing.newsletter",
        string kind = "Reservation",
        bool hasSpecialCategoryData = false) => new
        {
            code,
            kind,
            name = "Newsletter",
            text = "News about our courses and events. Reserve yourself at any time.",
            hasSpecialCategoryData
        };

    [Fact]
    public async Task Create_Should_Create_Version_1_In_The_Current_Organization()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();

        var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();

        var response = await client.PostAsJsonAsync(
            $"/v3/processing-purposes?orgId={org.Entity.OrganizationId}", NewPurposeBody());

        var created = await response.CheckOk().Content.ReadFromJsonAsync<ProcessingPurposeDto>(JsonOptions);
        Assert.NotNull(created);
        Assert.Equal("marketing.newsletter", created!.Code);
        Assert.Equal(1, created.Version);
        Assert.Equal(ProcessingPurpose.PurposeKind.Reservation, created.Kind);
        Assert.False(created.RequiresReconsent);

        var listed = await (await client.GetAsync($"/v3/processing-purposes?orgId={org.Entity.OrganizationId}"))
            .CheckOk().Content.ReadFromJsonAsync<ProcessingPurposeDto[]>(JsonOptions);
        Assert.Equal(created.Uuid, Assert.Single(listed!).Uuid);
    }

    [Fact]
    public async Task Create_Should_Forbid_Organization_Admin()
    {
        using var scope = _factory.Services.NewTestScope();
        using var admin = await scope.CreateUserAsync(role: Roles.Admin);
        using var org = await scope.CreateOrganizationAsync();
        using var member = await scope
            .CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);

        var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);

        var response = await client.PostAsJsonAsync(
            $"/v3/processing-purposes?orgId={org.Entity.OrganizationId}", NewPurposeBody());

        response.CheckForbidden();
    }

    [Fact]
    public async Task Create_Should_Reject_A_Code_The_Organization_Already_Uses()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();

        // Retired still counts: a reused code would make old decisions answer a new purpose.
        await SeedAsync(Purpose(org.Entity, "marketing.newsletter", retiredAt: Instant.FromUtc(2026, 10, 1, 12, 0)));

        var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();

        var response = await client.PostAsJsonAsync(
            $"/v3/processing-purposes?orgId={org.Entity.OrganizationId}", NewPurposeBody());

        Assert.Equal(System.Net.HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Create_Should_Reject_Special_Category_Data_As_A_Reservation()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();

        var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();

        var response = await client.PostAsJsonAsync(
            $"/v3/processing-purposes?orgId={org.Entity.OrganizationId}",
            NewPurposeBody(code: "registration.dietary", hasSpecialCategoryData: true));

        response.CheckBadRequest();
    }

    [Theory]
    [InlineData("Marketing.Newsletter")]
    [InlineData("marketing newsletter")]
    [InlineData(".marketing")]
    [InlineData("")]
    public async Task Create_Should_Reject_An_Invalid_Code(string code)
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();

        var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();

        var response = await client.PostAsJsonAsync(
            $"/v3/processing-purposes?orgId={org.Entity.OrganizationId}", NewPurposeBody(code: code));

        response.CheckBadRequest();
    }
}

