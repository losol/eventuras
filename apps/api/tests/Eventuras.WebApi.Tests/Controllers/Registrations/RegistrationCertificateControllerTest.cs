using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services;
using Eventuras.TestAbstractions;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Registrations;

public class RegistrationCertificateControllerTest : IClassFixture<CustomWebApiApplicationFactory<Program>>
{
    private readonly CustomWebApiApplicationFactory<Program> _factory;

    public RegistrationCertificateControllerTest(CustomWebApiApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Send_Should_Require_Auth()
    {
        var response = await _factory.CreateClient()
            .PostAsync("/v3/registrations/1001/certificate/send");
        response.CheckUnauthorized();
    }

    [Fact]
    public async Task Should_Return_NotFound_When_Sending_Non_Existing_Certificate()
    {
        var response = await _factory.CreateClient()
            .AuthenticatedAsSuperAdmin()
            .PostAsync("/v3/registrations/1001/certificate/send");
        response.CheckNotFound();
    }

    [Fact]
    public async Task Send_Should_Return_NotFound_When_Registration_Has_No_Certificate()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var evt = await scope.CreateEventAsync(organization: org.Entity);
        using var user = await scope.CreateUserAsync();
        using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);

        var response = await _factory.CreateClient()
            .AuthenticatedAsSuperAdmin()
            .PostAsync($"/v3/registrations/{reg.Entity.RegistrationId}/certificate/send");
        response.CheckNotFound();
    }

    [Fact]
    public async Task Send_Should_Not_Allow_Another_Regular_User_To_Send_Certificate()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var evt = await scope.CreateEventAsync(organization: org.Entity);
        using var user = await scope.CreateUserAsync();
        using var anotherUser = await scope.CreateUserAsync();
        using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);

        var response = await _factory.CreateClient()
            .AuthenticatedAs(anotherUser.Entity)
            .PostAsync($"/v3/registrations/{reg.Entity.RegistrationId}/certificate/send");

        response.CheckForbidden();
    }

    [Fact]
    public async Task Should_Not_Allow_Other_Org_Admin_To_Send_Certificate()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var otherOrg = await scope.CreateOrganizationAsync();
        using var otherOrgAdmin = await scope.CreateUserAsync();
        using var mem =
            await scope.CreateOrganizationMemberAsync(otherOrgAdmin.Entity, otherOrg.Entity, role: Roles.Admin);
        using var evt = await scope.CreateEventAsync(organization: org.Entity);
        using var user = await scope.CreateUserAsync();
        using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);

        var response = await _factory.CreateClient()
            .AuthenticatedAs(otherOrgAdmin.Entity, Roles.Admin)
            .PostAsync(
                $"/v3/registrations/{reg.Entity.RegistrationId}/certificate/send?orgId={org.Entity.OrganizationId}");

        response.CheckForbidden();
    }

    [Fact]
    public async Task Send_Should_Return_NotFound_If_No_Cert_Issued()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var evt = await scope.CreateEventAsync(organization: org.Entity);
        using var user = await scope.CreateUserAsync();
        using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);

        var response = await _factory.CreateClient()
            .AuthenticatedAs(user.Entity)
            .PostAsync($"/v3/registrations/{reg.Entity.RegistrationId}/certificate/send");

        response.CheckNotFound();
    }

    [Fact]
    public async Task Send_Should_Allow_Reg_User_To_Send_Certificate()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var evt = await scope.CreateEventAsync(organization: org.Entity);
        using var user = await scope.CreateUserAsync();
        using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
        using var cert = await scope.CreateCertificateAsync(reg.Entity);


        var emailExpectation = SetupCertificateEmailExpectation(user, evt);
        var response = await _factory.CreateClient()
            .AuthenticatedAs(user.Entity)
            .PostAsync($"/v3/registrations/{reg.Entity.RegistrationId}/certificate/send");

        response.CheckOk();

        // Wait for background worker to process the certificate delivery job
        await Task.Delay(1000);

        emailExpectation.VerifyEmailSent();
    }

    [Fact]
    public async Task Should_Allow_Org_Admin_To_Send_Certificate()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var admin = await scope.CreateUserAsync();
        using var mem =
            await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
        using var evt = await scope.CreateEventAsync(organization: org.Entity);
        using var user = await scope.CreateUserAsync();
        using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
        using var cert = await scope.CreateCertificateAsync(reg.Entity);

        var emailExpectation = SetupCertificateEmailExpectation(user, evt);

        var response = await _factory.CreateClient()
            .AuthenticatedAs(admin.Entity, Roles.Admin)
            .PostAsync(
                $"/v3/registrations/{reg.Entity.RegistrationId}/certificate/send?orgId={org.Entity.OrganizationId}");

        response.CheckOk();

        // Wait for background worker to process the certificate delivery job
        await Task.Delay(1000);

        emailExpectation.VerifyEmailSent();
    }

    [Theory]
    [InlineData(Roles.SuperAdmin)]
    [InlineData(Roles.SystemAdmin)]
    public async Task Should_Allow_Power_Admin_To_Send_Certificate(string role)
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var evt = await scope.CreateEventAsync(organization: org.Entity);
        using var user = await scope.CreateUserAsync();
        using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
        using var cert = await scope.CreateCertificateAsync(reg.Entity);

        var emailExpectation = SetupCertificateEmailExpectation(user, evt);

        var response = await _factory.CreateClient()
            .Authenticated(role: role)
            .PostAsync($"/v3/registrations/{reg.Entity.RegistrationId}/certificate/send");

        response.CheckOk();

        // Wait for background worker to process the certificate delivery job
        await Task.Delay(1000);

        emailExpectation.VerifyEmailSent();
    }

    private EmailExpectation SetupCertificateEmailExpectation(
        IDisposableEntity<ApplicationUser> user,
        IDisposableEntity<EventInfo> evt) =>
        _factory.EmailSenderMock
            .ExpectEmail()
            .SentTo(user.Entity.Email)
            .WithSubject($"Kursbevis for {evt.Entity.Title}")
            .HavingAttachment()
            .Setup();
}
