using System.Net.Mime;
using System.Threading.Tasks;
using Eventuras.Services;
using Eventuras.TestAbstractions;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Certificates;

public class CertificatesControllerTest : IClassFixture<CustomWebApiApplicationFactory<Program>>
{
    private readonly CustomWebApiApplicationFactory<Program> _factory;

    public CertificatesControllerTest(CustomWebApiApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Should_Require_Auth_For_Getting_Cert_Json()
    {
        var response = await _factory.CreateClient()
            .GetAsync("/v3/certificates/1");
        response.CheckUnauthorized();
    }

    [Fact]
    public async Task Should_Return_Not_Found_When_Getting_Non_Existing_Cert_Json()
    {
        const int nonExistingId = 10000;
        var response = await _factory.CreateClient()
            .AuthenticatedAsSuperAdmin()
            .GetAsync($"/v3/certificates/{nonExistingId}");
        response.CheckNotFound();
    }

    [Fact]
    public async Task Should_Not_Allow_To_Get_Certificate_To_Another_Regular_User()
    {
        using var scope = _factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var anotherUser = await scope.CreateUserAsync();
        using var evt = await scope.CreateEventAsync();
        using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
        using var cert = await scope.CreateCertificateAsync(reg.Entity);

        var response = await _factory.CreateClient()
            .AuthenticatedAs(anotherUser.Entity)
            .GetAsync($"/v3/certificates/{cert.Entity.CertificateId}");

        response.CheckForbidden();
    }

    [Fact]
    public async Task Should_Not_Allow_To_Get_Certificate_To_Other_Org_Admin()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var otherOrg = await scope.CreateOrganizationAsync();
        using var otherOrgAdmin = await scope.CreateUserAsync();
        using var mem = await scope.CreateOrganizationMemberAsync(otherOrgAdmin.Entity, otherOrg.Entity);
        using var evt = await scope.CreateEventAsync(organization: org.Entity);
        using var user = await scope.CreateUserAsync();
        using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
        using var cert = await scope.CreateCertificateAsync(reg.Entity);

        var response = await _factory.CreateClient()
            .AuthenticatedAs(otherOrgAdmin.Entity, Roles.Admin)
            .GetAsync($"/v3/certificates/{cert.Entity.CertificateId}?orgId={org.Entity.OrganizationId}");

        response.CheckForbidden();
    }

    [Fact]
    public async Task Should_Allow_To_Get_Certificate_To_Reg_User()
    {
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();
        using var user = await scope.CreateUserAsync();
        using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
        using var cert = await scope.CreateCertificateAsync(reg.Entity);

        var response = await _factory.CreateClient()
            .AuthenticatedAs(user.Entity)
            .GetAsync($"/v3/certificates/{cert.Entity.CertificateId}");

        var json = await response.CheckOk().AsTokenAsync();
        json.CheckCertificate(cert.Entity);
    }

    [Fact]
    public async Task Should_Allow_To_Get_Certificate_To_Org_Admin()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var admin = await scope.CreateUserAsync();
        using var m = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity);
        using var evt = await scope.CreateEventAsync(organization: org.Entity);
        using var user = await scope.CreateUserAsync();
        using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
        using var cert = await scope.CreateCertificateAsync(reg.Entity);

        var response = await _factory.CreateClient()
            .AuthenticatedAs(admin.Entity, Roles.Admin)
            .GetAsync($"/v3/certificates/{cert.Entity.CertificateId}?orgId={org.Entity.OrganizationId}");

        var json = await response.CheckOk().AsTokenAsync();
        json.CheckCertificate(cert.Entity);
    }

    [Theory]
    [InlineData(Roles.SuperAdmin)]
    [InlineData(Roles.SystemAdmin)]
    public async Task Should_Allow_To_Get_Certificate_To_Power_Admin(string role)
    {
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();
        using var user = await scope.CreateUserAsync();
        using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
        using var cert = await scope.CreateCertificateAsync(reg.Entity);

        var response = await _factory.CreateClient()
            .Authenticated(role: role)
            .GetAsync($"/v3/certificates/{cert.Entity.CertificateId}");

        var json = await response.CheckOk().AsTokenAsync();
        json.CheckCertificate(cert.Entity);
    }

    [Fact]
    public async Task Should_Return_Certificate_Json_Using_Accept_Header()
    {
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();
        using var user = await scope.CreateUserAsync();
        using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
        using var cert = await scope.CreateCertificateAsync(reg.Entity);

        var response = await _factory.CreateClient()
            .AuthenticatedAsSuperAdmin()
            .WithAcceptHeader(MediaTypeNames.Application.Json)
            .GetAsync($"/v3/certificates/{cert.Entity.CertificateId}");

        var json = await response.CheckOk().AsTokenAsync();
        json.CheckCertificate(cert.Entity);
    }

    [Fact]
    public async Task Should_Return_Certificate_Html_Using_Query_Param()
    {
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();
        using var user = await scope.CreateUserAsync();
        using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
        using var cert = await scope.CreateCertificateAsync(reg.Entity);

        var response = await _factory.CreateClient()
            .AuthenticatedAsSuperAdmin()
            .GetAsync($"/v3/certificates/{cert.Entity.CertificateId}?format=html");

        var html = await response.CheckOk().Content.ReadAsStringAsync();
        Assert.Equal(MediaTypeNames.Text.Html, response.Content.Headers.ContentType?.MediaType);
        Assert.Contains(cert.Entity.Title, html);
        Assert.Contains(user.Entity.Name, html);
        // TODO: check other properties?
    }

    [Fact]
    public async Task Should_Return_Certificate_Html_Using_Accept_Header()
    {
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();
        using var user = await scope.CreateUserAsync();
        using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
        using var cert = await scope.CreateCertificateAsync(reg.Entity);

        var response = await _factory.CreateClient()
            .AuthenticatedAsSuperAdmin()
            .WithAcceptHeader(MediaTypeNames.Text.Html)
            .GetAsync($"/v3/certificates/{cert.Entity.CertificateId}");

        var html = await response.CheckOk().Content.ReadAsStringAsync();
        Assert.Equal(MediaTypeNames.Text.Html, response.Content.Headers.ContentType?.MediaType);
        Assert.Contains(cert.Entity.Title, html);
        Assert.Contains(user.Entity.Name, html);
        // TODO: check other properties?
    }

    [Fact]
    public async Task Should_Return_Certificate_Pdf_Using_Query_Param()
    {
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();
        using var user = await scope.CreateUserAsync();
        using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
        using var cert = await scope.CreateCertificateAsync(reg.Entity);

        var response = await _factory.CreateClient()
            .AuthenticatedAsSuperAdmin()
            .GetAsync($"/v3/certificates/{cert.Entity.CertificateId}?format=pdf");

        var text = await response.CheckOk().Content.ReadAsPdfStringAsync();
        Assert.Contains(cert.Entity.Title, text);
        Assert.Contains(user.Entity.Name, text);
    }

    [Fact]
    public async Task Should_Return_Certificate_Pdf_Using_Accept_Header()
    {
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();
        using var user = await scope.CreateUserAsync();
        using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
        using var cert = await scope.CreateCertificateAsync(reg.Entity);

        var response = await _factory.CreateClient()
            .AuthenticatedAsSuperAdmin()
            .WithAcceptHeader(MediaTypeNames.Application.Pdf)
            .GetAsync($"/v3/certificates/{cert.Entity.CertificateId}");

        var text = await response.CheckOk().Content.ReadAsPdfStringAsync();
        Assert.Contains(cert.Entity.Title, text);
        Assert.Contains(user.Entity.Name, text);
    }
}
