using System;
using System.Diagnostics;
using System.Net.Mime;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services;
using Eventuras.TestAbstractions;
using Losol.Communication.Email;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Events.Certificates;

public class EventCertificatesControllerTest : IClassFixture<CustomWebApiApplicationFactory<Program>>, IDisposable
{
    private readonly CustomWebApiApplicationFactory<Program> _factory;

    public EventCertificatesControllerTest(CustomWebApiApplicationFactory<Program> factory)
    {
        _factory = factory;
        Cleanup();
    }

    public void Dispose() => Cleanup();

    private void Cleanup()
    {
        using var scope = _factory.Services.NewTestScope();
        scope.Db.Certificates.Clean();
        scope.Db.SaveChanges();
    }

    #region List

    [Fact]
    public async Task List_Should_Require_Auth()
    {
        var response = await _factory.CreateClient()
            .GetAsync("/v3/event/1001/certificates");
        response.CheckUnauthorized();
    }

    [Fact]
    public async Task List_Should_Require_Admin_Role()
    {
        var response = await _factory.CreateClient()
            .Authenticated()
            .GetAsync("/v3/event/1001/certificates");
        response.CheckForbidden();
    }

    [Fact]
    public async Task List_Should_Return_Not_Found_For_Non_Existing_Event()
    {
        var response = await _factory.CreateClient()
            .AuthenticatedAsSuperAdmin()
            .GetAsync("/v3/event/1001/certificates");
        response.CheckNotFound();
    }

    [Fact]
    public async Task List_Should_Not_Allow_Other_Org_Admin_To_Display_Event_Certs()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var otherOrg = await scope.CreateOrganizationAsync();
        using var otherOrgAdmin = await scope.CreateUserAsync();
        using var mem = await scope.CreateOrganizationMemberAsync(otherOrgAdmin.Entity, otherOrg.Entity);
        using var evt = await scope.CreateEventAsync(organization: org.Entity);

        var response = await _factory.CreateClient()
            .AuthenticatedAs(otherOrgAdmin.Entity, Roles.Admin)
            .GetAsync($"/v3/event/{evt.Entity.EventInfoId}/certificates?orgId={org.Entity.OrganizationId}");

        response.CheckForbidden();
    }

    [Fact]
    public async Task List_Should_Be_Available_For_Org_Admin()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var admin = await scope.CreateUserAsync();
        using var mem = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
        using var evt = await scope.CreateEventAsync(organization: org.Entity);

        var response = await _factory.CreateClient()
            .AuthenticatedAs(admin.Entity, Roles.Admin)
            .GetAsync($"/v3/event/{evt.Entity.EventInfoId}/certificates?orgId={org.Entity.OrganizationId}");

        response.CheckOk();
    }

    [Theory]
    [InlineData(Roles.SuperAdmin)]
    [InlineData(Roles.SystemAdmin)]
    public async Task List_Should_Be_Available_For_Power_Admin(string role)
    {
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();

        var response = await _factory.CreateClient()
            .Authenticated(role: role)
            .GetAsync($"/v3/event/{evt.Entity.EventInfoId}/certificates");

        response.CheckOk();
    }

    [Fact]
    public async Task List_Can_Be_Empty()
    {
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();

        var response = await _factory.CreateClient()
            .AuthenticatedAsSuperAdmin()
            .GetAsync($"/v3/event/{evt.Entity.EventInfoId}/certificates");

        var json = await response.CheckOk().AsTokenAsync();
        json.CheckEmptyPaging();
    }

    [Fact]
    public async Task List_Should_Not_List_Certificates_From_Another_Event()
    {
        using var scope = _factory.Services.NewTestScope();
        using var e1 = await scope.CreateEventAsync();
        using var user = await scope.CreateUserAsync();
        using var reg = await scope.CreateRegistrationAsync(e1.Entity, user.Entity);
        using var cert = await scope.CreateCertificateAsync(reg.Entity);
        using var e2 = await scope.CreateEventAsync();

        var response = await _factory.CreateClient()
            .AuthenticatedAsSuperAdmin()
            .GetAsync($"/v3/event/{e2.Entity.EventInfoId}/certificates");

        var json = await response.CheckOk().AsTokenAsync();
        json.CheckEmptyPaging();
    }

    public static object[][] GetInvalidListQueryParams() =>
        new[]
        {
            new object[] { new { page = "invalid" } }, new object[] { new { count = "invalid" } },
            new object[] { new { page = -1 } }, new object[] { new { page = 0 } },
            new object[] { new { count = -1 } }
        };

    [Theory]
    [MemberData(nameof(GetInvalidListQueryParams))]
    public async Task List_Should_Validate_Query_Params(object queryParams)
    {
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();

        var response = await _factory.CreateClient()
            .AuthenticatedAsSuperAdmin()
            .GetAsync($"/v3/event/{evt.Entity.EventInfoId}/certificates", queryParams);

        response.CheckBadRequest();
    }

    [Fact]
    public async Task List_Should_Use_Paging()
    {
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();
        using var u1 = await scope.CreateUserAsync();
        using var u2 = await scope.CreateUserAsync();
        using var u3 = await scope.CreateUserAsync();
        using var r1 = await scope.CreateRegistrationAsync(evt.Entity, u1.Entity);
        using var r2 = await scope.CreateRegistrationAsync(evt.Entity, u2.Entity);
        using var r3 = await scope.CreateRegistrationAsync(evt.Entity, u3.Entity);
        using var c1 = await scope.CreateCertificateAsync(r1.Entity);
        using var c2 = await scope.CreateCertificateAsync(r2.Entity);
        using var c3 = await scope.CreateCertificateAsync(r3.Entity);

        var response = await _factory.CreateClient()
            .AuthenticatedAsSuperAdmin()
            .GetAsync($"/v3/event/{evt.Entity.EventInfoId}/certificates?page=1&count=2");

        var json = await response.CheckOk().AsTokenAsync();
        json.CheckPaging(1, 3,
            (token, c) => token.CheckCertificate(c),
            c1.Entity, c2.Entity);

        response = await _factory.CreateClient()
            .AuthenticatedAsSuperAdmin()
            .GetAsync($"/v3/event/{evt.Entity.EventInfoId}/certificates?page=2&count=2");

        json = await response.CheckOk().AsTokenAsync();
        json.CheckPaging(2, 3,
            (token, c) => token.CheckCertificate(c),
            c3.Entity);
    }

    #endregion

    #region Preview

    [Fact]
    public async Task Should_Require_Auth_To_Preview_Event_Certificate()
    {
        var response = await _factory.CreateClient()
            .GetAsync("/v3/event/1001/certificates/preview");
        response.CheckUnauthorized();
    }

    [Fact]
    public async Task Should_Return_Not_Found_When_Previewing_Non_Existing_Event_Certificate()
    {
        var response = await _factory.CreateClient()
            .AuthenticatedAsSuperAdmin()
            .GetAsync("/v3/event/1001/certificates/preview");
        response.CheckNotFound();
    }

    [Fact]
    public async Task Should_Not_Allow_Regular_User_To_Preview_Event_Certificate()
    {
        var response = await _factory.CreateClient()
            .Authenticated()
            .GetAsync("/v3/event/1001/certificates/preview");
        response.CheckForbidden();
    }

    [Fact]
    public async Task Should_Not_Allow_Other_Org_Admin_To_Preview_Event_Certificate()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var otherOrg = await scope.CreateOrganizationAsync();
        using var otherOrgAdmin = await scope.CreateUserAsync();
        using var mem = await scope.CreateOrganizationMemberAsync(otherOrgAdmin.Entity, otherOrg.Entity);
        using var evt = await scope.CreateEventAsync(organization: org.Entity);

        var response = await _factory.CreateClient()
            .AuthenticatedAs(otherOrgAdmin.Entity, Roles.Admin)
            .GetAsync($"/v3/event/{evt.Entity.EventInfoId}/certificates/preview?orgId={org.Entity.OrganizationId}");

        response.CheckForbidden();
    }

    [Fact]
    public async Task Should_Allow_Org_Admin_To_Preview_Event_Certificate()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var admin = await scope.CreateUserAsync(role: Roles.Admin);
        using var mem = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
        using var evt = await scope.CreateEventAsync(organization: org.Entity);

        var response = await _factory.CreateClient()
            .AuthenticatedAs(admin.Entity, Roles.Admin)
            .GetAsync($"/v3/event/{evt.Entity.EventInfoId}/certificates/preview?orgId={org.Entity.OrganizationId}");

        var html = await response.CheckOk().Content.ReadAsStringAsync();
        Assert.Contains(evt.Entity.Title, html);
        Assert.Equal(MediaTypeNames.Text.Html, response.Content.Headers.ContentType?.MediaType);
    }

    [Theory]
    [InlineData(Roles.SystemAdmin)]
    [InlineData(Roles.SuperAdmin)]
    public async Task Should_Allow_Power_Admin_To_Preview_Event_Certificate(string role)
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var evt = await scope.CreateEventAsync(organization: org.Entity);

        var response = await _factory.CreateClient()
            .Authenticated(role: role)
            .GetAsync($"/v3/event/{evt.Entity.EventInfoId}/certificates/preview");

        var html = await response.CheckOk().Content.ReadAsStringAsync();
        Assert.Contains(evt.Entity.Title, html);
        Assert.Equal(MediaTypeNames.Text.Html, response.Content.Headers.ContentType?.MediaType);
    }

    #endregion

    #region Issue

    [Fact]
    public async Task Should_Require_Auth_To_Issue_Event_Certificate()
    {
        var response = await _factory.CreateClient()
            .PostAsync("/v3/event/1001/certificates/issue");
        response.CheckUnauthorized();
    }

    [Fact]
    public async Task Should_Return_Not_Found_When_Issuing_Non_Existing_Event_Certificate()
    {
        var response = await _factory.CreateClient()
            .AuthenticatedAsSuperAdmin()
            .PostAsync("/v3/event/1001/certificates/issue");
        response.CheckNotFound();
    }

    [Fact]
    public async Task Should_Not_Allow_Regular_User_To_Issue_Event_Certificate()
    {
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();

        var response = await _factory.CreateClient()
            .Authenticated()
            .PostAsync($"/v3/event/{evt.Entity.EventInfoId}/certificates/issue");

        response.CheckForbidden();
    }

    [Fact]
    public async Task Should_Not_Allow_Other_Org_Admin_To_Issue_Event_Certificate()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var otherOrg = await scope.CreateOrganizationAsync();
        using var otherOrgAdmin = await scope.CreateUserAsync();
        using var mem = await scope.CreateOrganizationMemberAsync(otherOrgAdmin.Entity, otherOrg.Entity);
        using var evt = await scope.CreateEventAsync(organization: org.Entity);

        var response = await _factory.CreateClient()
            .AuthenticatedAs(otherOrgAdmin.Entity, Roles.Admin)
            .PostAsync($"/v3/event/{evt.Entity.EventInfoId}/certificates/issue?orgId={org.Entity.OrganizationId}");

        response.CheckForbidden();
    }

    [Fact]
    public async Task Should_Allow_Org_Admin_To_Issue_Certificate()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var admin = await scope.CreateUserAsync();
        using var mem = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
        using var evt = await scope.CreateEventAsync(organization: org.Entity);

        var response = await _factory.CreateClient()
            .AuthenticatedAs(admin.Entity, Roles.Admin)
            .PostAsync($"/v3/event/{evt.Entity.EventInfoId}/certificates/issue?orgId={org.Entity.OrganizationId}");

        response.CheckOk();
    }

    [Theory]
    [InlineData(Roles.SystemAdmin)]
    [InlineData(Roles.SuperAdmin)]
    public async Task Should_Allow_Power_Admin_To_Issue_Event_Certificate(string role)
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var evt = await scope.CreateEventAsync(organization: org.Entity);

        var response = await _factory.CreateClient()
            .Authenticated(role: role)
            .PostAsync($"/v3/event/{evt.Entity.EventInfoId}/certificates/issue");

        response.CheckOk();
    }

    [Fact]
    public async Task Should_Issue_No_Certificates_For_Event_Without_Registrations()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var evt = await scope.CreateEventAsync(organization: org.Entity);

        var response = await _factory.CreateClient()
            .AuthenticatedAsSuperAdmin()
            .PostAsync($"/v3/event/{evt.Entity.EventInfoId}/certificates/issue");

        var json = await response.CheckOk().AsTokenAsync();
        Assert.Equal(0, json.GetValue<int>("issued"));
        Assert.Equal(0, await scope.Db.Certificates.CountAsync());
    }

    [Fact(Skip = "Flaky.")]
    public async Task Should_Only_Issue_Certificates_For_Finished_Registrations()
    {
        using var scope = _factory.Services.NewTestScope();
        await using var org = await scope.CreateOrganizationAsync();
        await using var evt = await scope.CreateEventAsync(organization: org.Entity);
        await using var admin = await scope.CreateUserAsync(email: "systemadmin@test.com", role: Roles.SystemAdmin);
        await using var u1 = await scope.CreateUserAsync(email: "user1@test.com");
        await using var u2 = await scope.CreateUserAsync(email: "user2@test.com");
        await using var r1 =
            await scope.CreateRegistrationAsync(evt.Entity, u1.Entity);
        await using var r2 =
            await scope.CreateRegistrationAsync(evt.Entity, u2.Entity, Registration.RegistrationStatus.Finished);

        var emailExpectation = _factory.EmailSenderMock
            .ExpectEmail()
            .SentTo(u2.Entity.Email)
            .WithSubject($"Kursbevis for {evt.Entity.Title}")
            .HavingAttachment()
            .Setup();

        var response = await _factory.CreateClient()
            .AuthenticatedAs(admin.Entity, Roles.SystemAdmin)
            .PostAsync($"/v3/event/{evt.Entity.EventInfoId}/certificates/issue",
                null, org.Entity.OrganizationId);

        var json = await response.CheckOk().AsTokenAsync();
        Assert.Equal(1, json.GetValue<int>("issued"));

        var cert = await scope.Db.Certificates.AsNoTracking().SingleAsync();
        Assert.Equal(cert.RecipientUserId, u2.Entity.Id);

        // Wait a bit for background processing to complete
        await Task.Delay(1000);

        emailExpectation.VerifyEmailSent();
    }

    [Fact]
    public async Task Should_Only_Issue_Certificates_Once()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var evt = await scope.CreateEventAsync(organization: org.Entity);
        using var user = await scope.CreateUserAsync();
        using var reg =
            await scope.CreateRegistrationAsync(evt.Entity, user.Entity, Registration.RegistrationStatus.Finished);
        using var cert = await scope.CreateCertificateAsync(reg.Entity);

        var response = await _factory.CreateClient()
            .AuthenticatedAsSuperAdmin()
            .PostAsync($"/v3/event/{evt.Entity.EventInfoId}/certificates/issue");

        var json = await response.CheckOk().AsTokenAsync();
        Assert.Equal(0, json.GetValue<int>("issued"));
    }

    [Fact]
    public async Task Issue_Certificate_Should_Use_Send_Query_Param()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var evt = await scope.CreateEventAsync(organization: org.Entity);
        using var user = await scope.CreateUserAsync();
        using var reg =
            await scope.CreateRegistrationAsync(evt.Entity, user.Entity, Registration.RegistrationStatus.Finished);

        var response = await _factory.CreateClient()
            .AuthenticatedAsSuperAdmin()
            .PostAsync($"/v3/event/{evt.Entity.EventInfoId}/certificates/issue?send=false");

        var json = await response.CheckOk().AsTokenAsync();
        Assert.Equal(1, json.GetValue<int>("issued"));

        _factory.EmailSenderMock.Verify(s => s
            .SendEmailAsync(It.IsAny<EmailModel>(), It.IsAny<EmailOptions>()), Times.Never);
    }

    #endregion

    #region Update

    [Fact]
    public async Task Should_Require_Auth_To_Update_Event_Certificate()
    {
        var response = await _factory.CreateClient()
            .PostAsync("/v3/event/1001/certificates/update");
        response.CheckUnauthorized();
    }

    [Fact]
    public async Task Should_Return_Not_Found_When_Updating_Non_Existing_Event_Certificate()
    {
        var response = await _factory.CreateClient()
            .AuthenticatedAsSuperAdmin()
            .PostAsync("/v3/event/1001/certificates/update");
        response.CheckNotFound();
    }

    [Fact]
    public async Task Should_Not_Allow_Regular_User_To_Update_Event_Certificate()
    {
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();

        var response = await _factory.CreateClient()
            .Authenticated()
            .PostAsync($"/v3/event/{evt.Entity.EventInfoId}/certificates/update");

        response.CheckForbidden();
    }

    [Fact]
    public async Task Should_Not_Allow_Other_Org_Admin_To_Update_Event_Certificate()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var otherOrg = await scope.CreateOrganizationAsync();
        using var otherOrgAdmin = await scope.CreateUserAsync();
        using var mem = await scope.CreateOrganizationMemberAsync(otherOrgAdmin.Entity, otherOrg.Entity);
        using var evt = await scope.CreateEventAsync(organization: org.Entity);

        var response = await _factory.CreateClient()
            .AuthenticatedAs(otherOrgAdmin.Entity, Roles.Admin)
            .PostAsync($"/v3/event/{evt.Entity.EventInfoId}/certificates/update?orgId={org.Entity.OrganizationId}");

        response.CheckForbidden();
    }

    [Fact]
    public async Task Should_Allow_Org_Admin_To_Update_Certificate()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var admin = await scope.CreateUserAsync();
        using var mem = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
        using var evt = await scope.CreateEventAsync(organization: org.Entity);

        var response = await _factory.CreateClient()
            .AuthenticatedAs(admin.Entity, Roles.Admin)
            .PostAsync($"/v3/event/{evt.Entity.EventInfoId}/certificates/update?orgId={org.Entity.OrganizationId}");

        response.CheckOk();
    }

    [Theory]
    [InlineData(Roles.SystemAdmin)]
    [InlineData(Roles.SuperAdmin)]
    public async Task Should_Allow_Power_Admin_To_Update_Event_Certificate(string role)
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var evt = await scope.CreateEventAsync(organization: org.Entity);

        var response = await _factory.CreateClient()
            .Authenticated(role: role)
            .PostAsync($"/v3/event/{evt.Entity.EventInfoId}/certificates/update");

        response.CheckOk();
    }

    [Fact]
    public async Task Should_Update_No_Certificates_For_Event_Without_Registrations()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var evt = await scope.CreateEventAsync(organization: org.Entity);

        var response = await _factory.CreateClient()
            .AuthenticatedAsSuperAdmin()
            .PostAsync($"/v3/event/{evt.Entity.EventInfoId}/certificates/update");

        var json = await response.CheckOk().AsTokenAsync();
        Assert.Equal(0, json.GetValue<int>("updated"));
        Assert.Equal(0, await scope.Db.Certificates.CountAsync());
    }

    [Fact]
    public async Task Should_Update_No_Certificates_If_Not_Issued()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var evt = await scope.CreateEventAsync(organization: org.Entity);
        using var user = await scope.CreateUserAsync();
        using var reg = await scope.CreateRegistrationAsync(
            evt.Entity, user.Entity, Registration.RegistrationStatus.Finished);

        var response = await _factory.CreateClient()
            .AuthenticatedAsSuperAdmin()
            .PostAsync($"/v3/event/{evt.Entity.EventInfoId}/certificates/update");

        var json = await response.CheckOk().AsTokenAsync();
        Assert.Equal(0, json.GetValue<int>("updated"));
        Assert.Equal(0, await scope.Db.Certificates.CountAsync());
    }

    [Fact]
    public async Task Should_Update_Certificate_Info()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var evt = await scope.CreateEventAsync(organization: org.Entity, title: "Test");
        using var user = await scope.CreateUserAsync();
        using var reg = await scope.CreateRegistrationAsync(
            evt.Entity, user.Entity, Registration.RegistrationStatus.Finished);
        using var cert = await scope.CreateCertificateAsync(reg.Entity);

        evt.Entity.Title = "Updated Event Title";
        await scope.Db.SaveChangesAsync();

        var response = await _factory.CreateClient()
            .AuthenticatedAsSuperAdmin()
            .PostAsync($"/v3/event/{evt.Entity.EventInfoId}/certificates/update");

        var json = await response.CheckOk().AsTokenAsync();
        Assert.Equal(1, json.GetValue<int>("updated"));

        var updatedCert = await scope.Db.Certificates.AsNoTracking().SingleAsync();
        Assert.Equal(updatedCert.CertificateId, cert.Entity.CertificateId);
        Assert.Equal("Updated Event Title", updatedCert.Title);
    }

    #endregion
}
