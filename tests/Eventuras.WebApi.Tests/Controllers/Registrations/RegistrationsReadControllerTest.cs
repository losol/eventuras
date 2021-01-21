using Eventuras.TestAbstractions;
using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using Eventuras.Services;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Registrations
{
    public class RegistrationsReadControllerTest : IClassFixture<CustomWebApiApplicationFactory<Startup>>
    {
        private readonly CustomWebApiApplicationFactory<Startup> _factory;

        public RegistrationsReadControllerTest(CustomWebApiApplicationFactory<Startup> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task Should_Return_Unauthorized_For_Not_Logged_In_User()
        {
            var client = _factory.CreateClient();

            var response = await client.GetAsync("/v3/registrations");
            response.CheckUnauthorized();
        }

        [Fact]
        public async Task Should_Return_Empty_Registration_List()
        {
            var client = _factory.CreateClient()
                .Authenticated();

            var response = await client.GetAsync("/v3/registrations");
            var paging = await response.AsTokenAsync();
            paging.CheckEmptyPaging();
        }

        [Theory]
        [InlineData("test", null)]
        [InlineData(-1, null)]
        [InlineData(0, null)]
        [InlineData(null, "test")]
        [InlineData(null, -1)]
        [InlineData(null, 101)]
        public async Task Should_Return_BadRequest_For_Invalid_Paging_Params(object page, object count)
        {
            var client = _factory.CreateClient().Authenticated();

            var q = new List<object>();
            if (page != null)
            {
                q.Add($"page={WebUtility.UrlEncode(page.ToString())}");
            }
            if (count != null)
            {
                q.Add($"count={WebUtility.UrlEncode(count.ToString())}");
            }

            var response = await client.GetAsync("/v3/registrations?" + string.Join("&", q));
            response.CheckBadRequest();
        }

        [Fact]
        public async Task Should_Use_Paging_For_Registration_List()
        {
            var client = _factory.CreateClient()
                .AuthenticatedAsSystemAdmin();

            using var scope = _factory.Services.NewTestScope();
            using var e = await scope.CreateEventAsync();
            using var user = await scope.CreateUserAsync();
            using var r1 = await scope.CreateRegistrationAsync(e.Entity, user.Entity, time: DateTime.Now.AddDays(3));
            using var r2 = await scope.CreateRegistrationAsync(e.Entity, user.Entity, time: DateTime.Now.AddDays(2));
            using var r3 = await scope.CreateRegistrationAsync(e.Entity, user.Entity, time: DateTime.Now.AddDays(1));

            var response = await client.GetAsync("/v3/registrations?page=1&count=2");
            var paging = await response.AsTokenAsync();
            paging.CheckPaging(1, 2, 3,
                (token, r) => token.CheckRegistration(r),
                r1.Entity, r2.Entity);

            response = await client.GetAsync("/v3/registrations?page=2&count=2");
            paging = await response.AsTokenAsync();
            paging.CheckPaging(2, 2, 3,
                (token, r) => token.CheckRegistration(r),
                r3.Entity);
        }

        [Fact]
        public async Task Should_Limit_Registrations_For_Regular_User()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var otherUser = await scope.CreateUserAsync();

            using var e = await scope.CreateEventAsync();
            using var r1 = await scope.CreateRegistrationAsync(e.Entity, user.Entity, time: DateTime.Now.AddDays(3));
            using var r2 = await scope.CreateRegistrationAsync(e.Entity, user.Entity, time: DateTime.Now.AddDays(2));
            using var r3 = await scope.CreateRegistrationAsync(e.Entity, otherUser.Entity, time: DateTime.Now.AddDays(1));

            var client = _factory.CreateClient()
                .AuthenticatedAs(user.Entity);

            var response = await client.GetAsync("/v3/registrations");
            var paging = await response.AsTokenAsync();
            paging.CheckPaging(1, 2,
                (token, r) => token.CheckRegistration(r),
                r1.Entity, r2.Entity);

            client.AuthenticatedAs(otherUser.Entity);

            response = await client.GetAsync("/v3/registrations");
            paging = await response.AsTokenAsync();
            paging.CheckPaging(1, 1,
                (token, r) => token.CheckRegistration(r),
                r3.Entity);
        }

        [Fact]
        public async Task Should_Limit_Registrations_For_Admin()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var otherUser = await scope.CreateUserAsync();
            using var admin = await scope.CreateUserAsync();
            using var otherAdmin = await scope.CreateUserAsync();
            using var org = await scope.CreateOrganizationAsync(hostname: "localhost");
            using var otherOrg = await scope.CreateOrganizationAsync();

            await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            await scope.CreateOrganizationMemberAsync(otherAdmin.Entity, otherOrg.Entity, role: Roles.Admin);

            using var e1 = await scope.CreateEventAsync(organization: org.Entity);
            using var e2 = await scope.CreateEventAsync(organization: otherOrg.Entity);
            using var r1 = await scope.CreateRegistrationAsync(e1.Entity, user.Entity, time: DateTime.Now.AddDays(3));
            using var r2 = await scope.CreateRegistrationAsync(e1.Entity, otherUser.Entity, time: DateTime.Now.AddDays(2));
            using var r3 = await scope.CreateRegistrationAsync(e2.Entity, otherUser.Entity, time: DateTime.Now.AddDays(1));

            var client = _factory.CreateClient()
                .AuthenticatedAs(admin.Entity, Roles.Admin);

            var response = await client.GetAsync("/v3/registrations");
            var paging = await response.AsTokenAsync();
            paging.CheckPaging(1, 2,
                (token, r) => token.CheckRegistration(r),
                r1.Entity, r2.Entity);

            client.AuthenticatedAs(otherAdmin.Entity, Roles.Admin);

            response = await client.GetAsync("/v3/registrations");
            paging = await response.AsTokenAsync();
            paging.CheckEmptyPaging();
        }

        [Fact]
        public async Task Should_Not_Limit_Registrations_For_System_Admin()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var otherUser = await scope.CreateUserAsync();

            using var e = await scope.CreateEventAsync();
            using var r1 = await scope.CreateRegistrationAsync(e.Entity, user.Entity, time: DateTime.Now.AddDays(3));
            using var r2 = await scope.CreateRegistrationAsync(e.Entity, user.Entity, time: DateTime.Now.AddDays(2));
            using var r3 = await scope.CreateRegistrationAsync(e.Entity, otherUser.Entity, time: DateTime.Now.AddDays(1));

            var client = _factory.CreateClient()
                .AuthenticatedAsSystemAdmin();

            var response = await client.GetAsync("/v3/registrations");
            var paging = await response.AsTokenAsync();
            paging.CheckPaging(1, 3,
                (token, r) => token.CheckRegistration(r),
                r1.Entity, r2.Entity, r3.Entity);
        }

        [Fact]
        public async Task Should_Not_Limit_Registrations_For_Super_Admin()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var otherUser = await scope.CreateUserAsync();

            using var e = await scope.CreateEventAsync();
            using var r1 = await scope.CreateRegistrationAsync(e.Entity, user.Entity, time: DateTime.Now.AddDays(3));
            using var r2 = await scope.CreateRegistrationAsync(e.Entity, user.Entity, time: DateTime.Now.AddDays(2));
            using var r3 = await scope.CreateRegistrationAsync(e.Entity, otherUser.Entity, time: DateTime.Now.AddDays(1));

            var client = _factory.CreateClient()
                .AuthenticatedAsSuperAdmin();

            var response = await client.GetAsync("/v3/registrations");
            var paging = await response.AsTokenAsync();
            paging.CheckPaging(1, 3,
                (token, r) => token.CheckRegistration(r),
                r1.Entity, r2.Entity, r3.Entity);
        }
    }
}
