using Eventuras.Domain;
using Eventuras.Services;
using Eventuras.TestAbstractions;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Registrations
{
    public class RegistrationsUpdateControllerTest : IClassFixture<CustomWebApiApplicationFactory<Startup>>
    {
        private readonly CustomWebApiApplicationFactory<Startup> _factory;

        public RegistrationsUpdateControllerTest(CustomWebApiApplicationFactory<Startup> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task Should_Require_Auth_For_Creating_New_Reg()
        {
            var client = _factory.CreateClient();
            var response = await client.PostAsync("/v3/registrations", new
            {
                userId = Guid.NewGuid(),
                eventId = Guid.NewGuid()
            });
            response.CheckUnauthorized();
        }

        [Fact]
        public async Task Should_Return_Not_Found_For_Unknown_User_Id()
        {
            var client = _factory.CreateClient().Authenticated();
            using var scope = _factory.Services.NewTestScope();
            using var e = await scope.CreateEventAsync();
            var response = await client.PostAsync("/v3/registrations", new
            {
                userId = Guid.NewGuid(),
                eventId = e.Entity.EventInfoId
            });
            response.CheckNotFound();
        }

        [Fact]
        public async Task Should_Return_Not_Found_For_Unknown_Event_Id()
        {
            var client = _factory.CreateClient().Authenticated();
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            var response = await client.PostAsync("/v3/registrations", new
            {
                userId = user.Entity.Id,
                eventId = 1001
            });
            response.CheckNotFound();
        }

        [Fact]
        public async Task Should_Require_Event_Id_For_Creating_New_Reg()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();

            var client = _factory.CreateClient().AuthenticatedAs(user.Entity);
            var response = await client.PostAsync("/v3/registrations", new { userId = user.Entity.Id });
            response.CheckBadRequest();
        }

        [Fact]
        public async Task Should_Require_User_Id_For_Creating_New_Reg()
        {
            var client = _factory.CreateClient().Authenticated();
            var response = await client.PostAsync("/v3/registrations", new { eventId = 10001 });
            response.CheckBadRequest();
        }

        [Fact]
        public async Task Should_Not_Allow_Admin_To_Create_Reg_For_Inaccessible_Event()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var admin = await scope.CreateUserAsync(role: Roles.Admin);
            using var org = await scope.CreateOrganizationAsync(hostname: "localhost");
            using var e = await scope.CreateEventAsync(organization: org.Entity);

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);
            var response = await client.PostAsync("/v3/registrations", new
            {
                userId = user.Entity.Id,
                eventId = e.Entity.EventInfoId
            });
            response.CheckForbidden();
        }

        [Fact]
        public async Task Should_Allow_Regular_User_To_Register_To_Event_Open_For_Registrations()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var e = await scope.CreateEventAsync(status: EventInfo.EventInfoStatus.RegistrationsOpen);

            var client = _factory.CreateClient().AuthenticatedAs(user.Entity);
            var response = await client.PostAsync("/v3/registrations", new
            {
                userId = user.Entity.Id,
                eventId = e.Entity.EventInfoId
            });
            response.CheckOk();

            var reg = await scope.Db.Registrations.SingleAsync(r =>
                r.EventInfoId == e.Entity.EventInfoId &&
                r.UserId == user.Entity.Id);

            var token = await response.AsTokenAsync();
            token.CheckRegistration(reg);
        }

        [Fact]
        public async Task Should_Not_Allow_Regular_User_To_Register_To_Event_Not_Open_For_Registrations()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var e = await scope.CreateEventAsync();

            var client = _factory.CreateClient().AuthenticatedAs(user.Entity);
            var response = await client.PostAsync("/v3/registrations", new
            {
                userId = user.Entity.Id,
                eventId = e.Entity.EventInfoId
            });
            response.CheckForbidden();
        }

        [Theory]
        [MemberData(nameof(GetRegInfoWithAdditionalInfoFilled))]
        public async Task Should_Not_Allow_Regular_User_To_Provide_Extra_Info(Func<string, int, object> f, Action<Registration> _)
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var e = await scope.CreateEventAsync();

            var client = _factory.CreateClient().AuthenticatedAs(user.Entity);
            var response = await client.PostAsync("/v3/registrations", f(user.Entity.Id, e.Entity.EventInfoId));
            response.CheckBadRequest();
        }

        [Fact]
        public async Task Should_Allow_Admin_To_Create_Reg_For_Accessible_Event()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var admin = await scope.CreateUserAsync(role: Roles.Admin);
            using var org = await scope.CreateOrganizationAsync(hostname: "localhost");
            using var member = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            using var e = await scope.CreateEventAsync(organization: org.Entity);

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);
            var response = await client.PostAsync("/v3/registrations", new
            {
                userId = user.Entity.Id,
                eventId = e.Entity.EventInfoId
            });
            response.CheckOk();

            var reg = await scope.Db.Registrations.SingleAsync(r =>
                r.EventInfoId == e.Entity.EventInfoId &&
                r.UserId == user.Entity.Id);

            var token = await response.AsTokenAsync();
            token.CheckRegistration(reg);
        }

        [Theory]
        [MemberData(nameof(GetRegInfoWithAdditionalInfoFilled))]
        public async Task Should_Allow_Admin_To_Provide_Extra_Info_When_Creating_New_Reg(Func<string, int, object> f, Action<Registration> check)
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var admin = await scope.CreateUserAsync(role: Roles.Admin);
            using var org = await scope.CreateOrganizationAsync(hostname: "localhost");
            using var member = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            using var e = await scope.CreateEventAsync(organization: org.Entity, organizationId: org.Entity.OrganizationId);

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);
            var response = await client.PostAsync("/v3/registrations", f(user.Entity.Id, e.Entity.EventInfoId));
            response.CheckOk();

            var reg = await scope.Db.Registrations.SingleAsync(r =>
                r.EventInfoId == e.Entity.EventInfoId &&
                r.UserId == user.Entity.Id);

            var token = await response.AsTokenAsync();
            token.CheckRegistration(reg);
            check(reg);
        }

        [Fact]
        public async Task Should_Allow_System_Admin_To_Create_Reg_For_Any_Event()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var e = await scope.CreateEventAsync();

            var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
            var response = await client.PostAsync("/v3/registrations", new
            {
                userId = user.Entity.Id,
                eventId = e.Entity.EventInfoId
            });
            response.CheckOk();

            var reg = await scope.Db.Registrations.SingleAsync(r =>
                r.EventInfoId == e.Entity.EventInfoId &&
                r.UserId == user.Entity.Id);

            var token = await response.AsTokenAsync();
            token.CheckRegistration(reg);
        }

        [Theory]
        [MemberData(nameof(GetRegInfoWithAdditionalInfoFilled))]
        public async Task Should_Allow_System_Admin_To_Provide_Extra_Info(Func<string, int, object> f, Action<Registration> check)
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var e = await scope.CreateEventAsync();

            var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
            var response = await client.PostAsync("/v3/registrations", f(user.Entity.Id, e.Entity.EventInfoId));
            response.CheckOk();

            var reg = await scope.Db.Registrations.SingleAsync(r =>
                r.EventInfoId == e.Entity.EventInfoId &&
                r.UserId == user.Entity.Id);

            var token = await response.AsTokenAsync();
            token.CheckRegistration(reg);
            check(reg);
        }


        [Fact]
        public async Task Should_Require_Auth_For_Updating_Reg()
        {
            var client = _factory.CreateClient();
            var response = await client.PutAsync("/v3/registrations/1", new
            {
                type = 1
            });
            response.CheckUnauthorized();
        }

        [Fact]
        public async Task Should_Return_Not_Found_When_Updating_Unknown_Reg()
        {
            var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
            var response = await client.PutAsync("/v3/registrations/1", new
            {
                type = 1
            });
            response.CheckNotFound();
        }

        [Fact]
        public async Task Should_Not_Allow_Regular_User_To_Update_Own_Reg()
        {
            var client = _factory.CreateClient().Authenticated();
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var e = await scope.CreateEventAsync();
            using var registration = await scope.CreateRegistrationAsync(e.Entity, user.Entity);
            var response = await client.PutAsync($"/v3/registrations/{registration.Entity.RegistrationId}", new { });
            response.CheckForbidden();
        }

        [Fact]
        public async Task Should_Not_Allow_Admin_To_Update_Reg_For_Inaccessible_Event()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var admin = await scope.CreateUserAsync(role: Roles.Admin);
            using var org = await scope.CreateOrganizationAsync(hostname: "localhost");
            using var e = await scope.CreateEventAsync(organization: org.Entity);
            using var registration = await scope.CreateRegistrationAsync(e.Entity, user.Entity);

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);
            var response = await client.PutAsync($"/v3/registrations/{registration.Entity.RegistrationId}", new
            {
                type = 2
            });
            response.CheckForbidden();
        }

[Fact]
        public async Task Should_Allow_SystemAdmin_To_Update_Reg_For_Accessible_Event()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var admin = await scope.CreateUserAsync(role: Roles.SystemAdmin);
            using var org = await scope.CreateOrganizationAsync(hostname: "localhost");
            using var member = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            using var e = await scope.CreateEventAsync(organization: org.Entity);
            using var registration = await scope.CreateRegistrationAsync(e.Entity, user.Entity);
            Assert.Equal(Registration.RegistrationType.Participant, registration.Entity.Type);

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.SystemAdmin);
            var response = await client.PutAsync($"/v3/registrations/{registration.Entity.RegistrationId}", new
            {
                type = 2
            });
            response.CheckOk();

            var updated = await LoadAndCheckAsync(scope, registration.Entity, updated =>
                Assert.Equal(Registration.RegistrationType.Staff, updated.Type));

            var token = await response.AsTokenAsync();
            token.CheckRegistration(updated);
        }

        [Fact(Skip = "Rewrite when organization admin is in place again.")]
        public async Task Should_Allow_Admin_To_Update_Reg_For_Accessible_Event()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var admin = await scope.CreateUserAsync(role: Roles.Admin);
            using var org = await scope.CreateOrganizationAsync(hostname: "localhost");
            using var member = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            using var e = await scope.CreateEventAsync(organization: org.Entity);
            using var registration = await scope.CreateRegistrationAsync(e.Entity, user.Entity);
            Assert.Equal(Registration.RegistrationType.Participant, registration.Entity.Type);

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);
            var response = await client.PutAsync($"/v3/registrations/{registration.Entity.RegistrationId}", new
            {
                type = 2
            });
            response.CheckOk();

            var updated = await LoadAndCheckAsync(scope, registration.Entity, updated =>
                Assert.Equal(Registration.RegistrationType.Staff, updated.Type));

            var token = await response.AsTokenAsync();
            token.CheckRegistration(updated);
        }

        [Fact]
        public async Task Should_Allow_System_Admin_To_Update_Any_Reg()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var e = await scope.CreateEventAsync();
            using var registration = await scope.CreateRegistrationAsync(e.Entity, user.Entity);

            var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
            var response = await client.PutAsync($"/v3/registrations/{registration.Entity.RegistrationId}", new
            {
                type = 2
            });
            response.CheckOk();

            var updated = await LoadAndCheckAsync(scope, registration.Entity, updated =>
                Assert.Equal(Registration.RegistrationType.Staff, updated.Type));

            var token = await response.AsTokenAsync();
            token.CheckRegistration(updated);
        }

       

        [Fact]
        public async Task Should_Require_Auth_For_Cancelling_Reg()
        {
            var client = _factory.CreateClient();
            var response = await client.DeleteAsync("/v3/registrations/1");
            response.CheckUnauthorized();
        }

        [Fact]
        public async Task Should_Return_Not_Found_When_Cancelling_Unknown_Reg()
        {
            var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
            var response = await client.DeleteAsync("/v3/registrations/1");
            response.CheckNotFound();
        }

        [Fact]
        public async Task Should_Not_Allow_Regular_User_To_Cancel_Own_Reg()
        {
            var client = _factory.CreateClient().Authenticated();
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var e = await scope.CreateEventAsync();
            using var registration = await scope.CreateRegistrationAsync(e.Entity, user.Entity);
            var response = await client.DeleteAsync($"/v3/registrations/{registration.Entity.RegistrationId}");
            response.CheckForbidden();
        }

        [Fact]
        public async Task Should_Not_Allow_Admin_To_Cancel_Reg_For_Inaccessible_Event()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var admin = await scope.CreateUserAsync(role: Roles.Admin);
            using var org = await scope.CreateOrganizationAsync(hostname: "localhost");
            using var e = await scope.CreateEventAsync(organization: org.Entity);
            using var registration = await scope.CreateRegistrationAsync(e.Entity, user.Entity);

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);
            var response = await client.DeleteAsync($"/v3/registrations/{registration.Entity.RegistrationId}");
            response.CheckForbidden();
        }

        [Fact]
        public async Task Should_Allow_Admin_To_Cancel_Reg_For_Accessible_Event()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var admin = await scope.CreateUserAsync(role: Roles.Admin);
            using var org = await scope.CreateOrganizationAsync(hostname: "localhost");
            using var member = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            using var e = await scope.CreateEventAsync(organization: org.Entity);
            using var registration = await scope.CreateRegistrationAsync(e.Entity, user.Entity);
            Assert.Equal(Registration.RegistrationType.Participant, registration.Entity.Type);

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);
            var response = await client.DeleteAsync($"/v3/registrations/{registration.Entity.RegistrationId}");
            response.CheckOk();

            await LoadAndCheckAsync(scope, registration.Entity, updated =>
                Assert.Equal(Registration.RegistrationStatus.Cancelled, updated.Status));
        }

        [Fact]
        public async Task Should_Allow_System_Admin_To_Cancel_Any_Reg()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var e = await scope.CreateEventAsync();
            using var registration = await scope.CreateRegistrationAsync(e.Entity, user.Entity);

            var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
            var response = await client.DeleteAsync($"/v3/registrations/{registration.Entity.RegistrationId}");
            response.CheckOk();

            await LoadAndCheckAsync(scope, registration.Entity, updated =>
                Assert.Equal(Registration.RegistrationStatus.Cancelled, updated.Status));
        }

        [Fact]
        public async Task Should_Allow_To_Cancel_Second_Time()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var e = await scope.CreateEventAsync();
            using var registration = await scope.CreateRegistrationAsync(e.Entity, user.Entity, Registration.RegistrationStatus.Cancelled);

            var client = _factory.CreateClient().AuthenticatedAsSuperAdmin();
            var response = await client.DeleteAsync($"/v3/registrations/{registration.Entity.RegistrationId}");
            response.CheckOk();

            await LoadAndCheckAsync(scope, registration.Entity, updated =>
                Assert.Equal(Registration.RegistrationStatus.Cancelled, updated.Status));
        }

        private async Task<Registration> LoadAndCheckAsync(TestServiceScope scope, Registration registration, Action<Registration> check)
        {
            var updated = await scope.Db.Registrations
                .AsNoTracking()
                .SingleAsync(r =>
                    r.RegistrationId == registration.RegistrationId);

            check(updated);
            return updated;
        }

        public static object[][] GetRegInfoWithAdditionalInfoFilled()
        {
            return new[]
            {
                new object[]
                {
                    new Func<string, int, object>((userId, eventId) => new {userId, eventId, notes = "test"}),
                    new Action<Registration>(reg => Assert.Equal("test", reg.Notes))
                },
                new object[]
                {
                    new Func<string, int, object>((userId, eventId) => new {userId, eventId, type = 1}),
                    new Action<Registration>(reg => Assert.Equal(Registration.RegistrationType.Student, reg.Type))
                },
                new object[]
                {
                    new Func<string, int, object>((userId, eventId) => new {userId, eventId, paymentMethod = 1}),
                    new Action<Registration>(reg => Assert.Equal(PaymentMethod.PaymentProvider.EmailInvoice, reg.PaymentMethod))
                },
                new object[]
                {
                    new Func<string, int, object>((userId, eventId) => new {userId, eventId, customer = new {name = "test"}}),
                    new Action<Registration>(reg => Assert.Equal("test", reg.CustomerName))
                }
            };
        }
    }
}
