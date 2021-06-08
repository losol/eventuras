using System;
using System.Net.Http;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services;
using Eventuras.TestAbstractions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Organizations
{
    public class OrganizationSettingsControllerTest : IClassFixture<CustomWebApiApplicationFactory<Startup>>
    {
        private readonly CustomWebApiApplicationFactory<Startup> _factory;

        public OrganizationSettingsControllerTest(CustomWebApiApplicationFactory<Startup> factory)
        {
            _factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        [Fact]
        public async Task List_Should_Require_Auth()
        {
            var response = await _factory.CreateClient()
                .GetAsync("/v3/organizations/1/settings");
            response.CheckUnauthorized();
        }

        [Fact]
        public async Task List_Should_Require_Admin_Role()
        {
            var response = await _factory.CreateClient()
                .Authenticated()
                .GetAsync("/v3/organizations/1/settings");
            response.CheckForbidden();
        }

        [Fact]
        public async Task List_Should_Return_Not_Found_If_No_Org_Exists()
        {
            var response = await _factory.CreateClient()
                .AuthenticatedAsAdmin()
                .GetAsync("/v3/organizations/10001/settings");
            response.CheckNotFound();
        }

        [Fact]
        public async Task List_Should_Not_Be_Available_To_Other_Org_Admin()
        {
            using var scope = _factory.Services.NewTestScope();
            using var org = await scope.CreateOrganizationAsync();
            var response = await _factory.CreateClient()
                .AuthenticatedAsAdmin()
                .GetAsync($"/v3/organizations/{org.Entity.OrganizationId}/settings");
            response.CheckForbidden();
        }

        [Fact]
        public async Task List_Should_Return_Settings_For_Org_Admin()
        {
            using var scope = _factory.Services.NewTestScope();
            using var admin = await scope.CreateUserAsync();
            using var org = await scope.CreateOrganizationAsync();
            using var member = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);

            var response = await _factory.CreateClient()
                .AuthenticatedAs(admin.Entity, Roles.Admin)
                .GetAsync($"/v3/organizations/{org.Entity.OrganizationId}/settings");

            var arr = await response.CheckOk().AsArrayAsync();
            Assert.NotEmpty(arr);
            Assert.Contains(arr, t => t.Value<string>("name") == OrgSettingsTestRegistryComponent.StringKey);
        }

        [Theory]
        [InlineData(Roles.SuperAdmin)]
        [InlineData(Roles.SystemAdmin)]
        public async Task List_Should_Return_Settings_For_Power_Admin(string role)
        {
            using var scope = _factory.Services.NewTestScope();
            using var org = await scope.CreateOrganizationAsync();

            var response = await _factory.CreateClient()
                .Authenticated(role: role)
                .GetAsync($"/v3/organizations/{org.Entity.OrganizationId}/settings");

            var arr = await response.CheckOk().AsArrayAsync();
            Assert.NotEmpty(arr);
            Assert.Contains(arr, t => t.Value<string>("name") == OrgSettingsTestRegistryComponent.StringKey);
        }

        [Fact]
        public async Task List_Should_Use_Cache()
        {
            using var scope = _factory.Services.NewTestScope();
            using var org = await scope.CreateOrganizationAsync();

            using var s = await scope
                .CreateOrganizationSettingAsync(org.Entity,
                    OrgSettingsTestRegistryComponent.StringKey,
                    "12345");

            var client = _factory.CreateClient()
                .Authenticated(role: Roles.SystemAdmin);

            var response = await client
                .GetAsync($"/v3/organizations/{org.Entity.OrganizationId}/settings");

            response.CheckOk();

            var arr = await response.AsArrayAsync();
            Assert.NotEmpty(arr);
            Assert.Contains(arr, t => t.Value<string>("name") == OrgSettingsTestRegistryComponent.StringKey &&
                                      t.Value<string>("value") == "12345");

            s.Entity.Value = "67890";
            await s.SaveAsync();

            response = await client
                .GetAsync($"/v3/organizations/{org.Entity.OrganizationId}/settings");

            arr = await response.CheckOk().AsArrayAsync();
            Assert.Contains(arr, t => t.Value<string>("name") == OrgSettingsTestRegistryComponent.StringKey &&
                                      t.Value<string>("value") == "12345");
            Assert.DoesNotContain(arr, t => t.Value<string>("name") == OrgSettingsTestRegistryComponent.StringKey &&
                                            t.Value<string>("value") == "67890");

            var cache = scope.GetService<IMemoryCache>();
            cache.Remove($"org-settings-{org.Entity.OrganizationId}");

            response = await client
                .GetAsync($"/v3/organizations/{org.Entity.OrganizationId}/settings");

            arr = await response.CheckOk().AsArrayAsync();
            Assert.Contains(arr, t => t.Value<string>("name") == OrgSettingsTestRegistryComponent.StringKey &&
                                      t.Value<string>("value") == "67890");
        }

        [Fact]
        public async Task Update_Should_Require_Auth()
        {
            var response = await _factory.CreateClient()
                .PutAsync("/v3/organizations/1/settings");
            response.CheckUnauthorized();
        }

        [Fact]
        public async Task Update_Should_Require_Admin_Role()
        {
            var response = await _factory.CreateClient()
                .Authenticated()
                .PutAsync("/v3/organizations/1/settings");
            response.CheckForbidden();
        }

        [Fact]
        public async Task Update_Should_Require_Setting_Name()
        {
            using var scope = _factory.Services.NewTestScope();
            using var org = await scope.CreateOrganizationAsync();
            var response = await _factory.CreateClient()
                .AuthenticatedAsSuperAdmin()
                .PutAsync($"/v3/organizations/{org.Entity.OrganizationId}/settings");
            response.CheckBadRequest();
        }

        [Fact]
        public async Task Update_Should_Not_Be_Available_To_Other_Org_Admin()
        {
            using var scope = _factory.Services.NewTestScope();
            using var org = await scope.CreateOrganizationAsync();
            var response = await _factory.CreateClient()
                .AuthenticatedAsAdmin()
                .PutAsync($"/v3/organizations/{org.Entity.OrganizationId}/settings",
                    new {name = OrgSettingsTestRegistryComponent.StringKey});
            response.CheckForbidden();
        }

        [Fact]
        public async Task Update_Should_Return_Not_Found_If_No_Org_Exists()
        {
            using var scope = _factory.Services.NewTestScope();
            var response = await _factory.CreateClient()
                .AuthenticatedAsSuperAdmin()
                .PutAsync("/v3/organizations/1111/settings",
                    new {name = "any"});
            response.CheckNotFound();
        }

        [Fact]
        public async Task Update_Should_Return_Not_Found_If_No_Setting_Registered()
        {
            using var scope = _factory.Services.NewTestScope();
            using var org = await scope.CreateOrganizationAsync();
            var response = await _factory.CreateClient()
                .AuthenticatedAsSystemAdmin()
                .PutAsync($"/v3/organizations/{org.Entity.OrganizationId}/settings",
                    new {name = "any"});
            response.CheckNotFound();
        }

        public static object[][] GetInvalidValuesForUpdate()
        {
            return new[]
            {
                new object[] {OrgSettingsTestRegistryComponent.NumberKey, "abc"},
                new object[] {OrgSettingsTestRegistryComponent.NumberKey, "#$%"},
                new object[] {OrgSettingsTestRegistryComponent.UrlKey, "anything"},
                new object[] {OrgSettingsTestRegistryComponent.UrlKey, "url.com"},
                new object[] {OrgSettingsTestRegistryComponent.EmailKey, "anything"},
                new object[] {OrgSettingsTestRegistryComponent.EmailKey, "http://url.com"}
            };
        }

        [Theory]
        [MemberData(nameof(GetInvalidValuesForUpdate))]
        public async Task Update_Should_Return_Bad_Request_For_Invalid_Value_Provided(string name, string value)
        {
            using var scope = _factory.Services.NewTestScope();
            using var org = await scope.CreateOrganizationAsync();
            var response = await _factory.CreateClient()
                .AuthenticatedAsSystemAdmin()
                .PutAsync($"/v3/organizations/{org.Entity.OrganizationId}/settings",
                    new {name, value});
            response.CheckBadRequest();
        }

        public static object[][] GetValidValuesForUpdate()
        {
            return new[]
            {
                new object[] {OrgSettingsTestRegistryComponent.StringKey, "anything"},
                new object[] {OrgSettingsTestRegistryComponent.StringKey, "0"},
                new object[] {OrgSettingsTestRegistryComponent.StringKey, "1.1"},
                new object[] {OrgSettingsTestRegistryComponent.NumberKey, "0"},
                new object[] {OrgSettingsTestRegistryComponent.NumberKey, "-1"},
                new object[] {OrgSettingsTestRegistryComponent.NumberKey, "-1.13"},
                new object[] {OrgSettingsTestRegistryComponent.NumberKey, "0.13"},
                new object[] {OrgSettingsTestRegistryComponent.NumberKey, "1.13"},
                new object[] {OrgSettingsTestRegistryComponent.UrlKey, "http://url.com"},
                new object[] {OrgSettingsTestRegistryComponent.UrlKey, "https://url.com"},
                new object[] {OrgSettingsTestRegistryComponent.UrlKey, "any://url.com"},
                new object[] {OrgSettingsTestRegistryComponent.UrlKey, "http://user:pass@url.com"},
                new object[] {OrgSettingsTestRegistryComponent.EmailKey, "any@email.com"}
            };
        }

        [Theory]
        [MemberData(nameof(GetValidValuesForUpdate))]
        public async Task Update_Should_Return_Ok_If_Valid_Value_Provided(string name, string value)
        {
            using var scope = _factory.Services.NewTestScope();
            using var org = await scope.CreateOrganizationAsync();

            var response = await _factory.CreateClient()
                .AuthenticatedAsSystemAdmin()
                .PutAsync($"/v3/organizations/{org.Entity.OrganizationId}/settings",
                    new {name, value});

            var t = await response.CheckOk().AsTokenAsync();
            Assert.NotEmpty(t);
            Assert.Equal(name, t.Value<string>("name"));
            Assert.Equal(value, t.Value<string>("value"));

            var setting = await scope.Db.OrganizationSettings
                .AsNoTracking()
                .SingleAsync(s => s.Name == name &&
                                  s.OrganizationId == org.Entity.OrganizationId);

            Assert.Equal(value, setting.Value);
        }

        [Fact]
        public async Task Update_Should_Be_Available_To_Org_Admin()
        {
            using var scope = _factory.Services.NewTestScope();
            using var admin = await scope.CreateUserAsync();
            using var org = await scope.CreateOrganizationAsync();
            using var member = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);

            var response = await _factory.CreateClient()
                .AuthenticatedAs(admin.Entity, Roles.Admin)
                .PutAsync($"/v3/organizations/{org.Entity.OrganizationId}/settings",
                    new {name = OrgSettingsTestRegistryComponent.StringKey, value = "any"});

            var t = await response.CheckOk().AsTokenAsync();
            Assert.NotEmpty(t);
            Assert.Equal(OrgSettingsTestRegistryComponent.StringKey, t.Value<string>("name"));
            Assert.Equal("any", t.Value<string>("value"));
        }

        [Theory]
        [InlineData(Roles.SystemAdmin)]
        [InlineData(Roles.SuperAdmin)]
        public async Task Update_Should_Be_Available_To_Power_Admin(string role)
        {
            using var scope = _factory.Services.NewTestScope();
            using var org = await scope.CreateOrganizationAsync();

            var response = await _factory.CreateClient()
                .Authenticated(role: role)
                .PutAsync($"/v3/organizations/{org.Entity.OrganizationId}/settings",
                    new {name = OrgSettingsTestRegistryComponent.StringKey, value = "any"});

            var t = await response.CheckOk().AsTokenAsync();
            Assert.NotEmpty(t);
            Assert.Equal(OrgSettingsTestRegistryComponent.StringKey, t.Value<string>("name"));
            Assert.Equal("any", t.Value<string>("value"));
        }

        [Fact]
        public async Task Update_Should_Add_New_Setting_If_Not_Exists()
        {
            using var scope = _factory.Services.NewTestScope();
            using var org = await scope.CreateOrganizationAsync();

            scope.Db.OrganizationSettings.Clean();
            await scope.Db.SaveChangesAsync();
            Assert.False(await scope.Db.OrganizationSettings.AnyAsync());

            var client = _factory.CreateClient()
                .AuthenticatedAsSuperAdmin();

            await client.CheckSettingReturnedAsync(org,
                OrgSettingsTestRegistryComponent.StringKey, null);

            var response = await client
                .PutAsync($"/v3/organizations/{org.Entity.OrganizationId}/settings",
                    new {name = OrgSettingsTestRegistryComponent.StringKey, value = "any"});

            response.CheckOk();

            Assert.NotNull(await scope.Db.OrganizationSettings
                .SingleAsync(s => s.OrganizationId == org.Entity.OrganizationId &&
                                  s.Name == OrgSettingsTestRegistryComponent.StringKey &&
                                  s.Value == "any"));

            // check that cache is invalidated
            await client.CheckSettingReturnedAsync(org,
                OrgSettingsTestRegistryComponent.StringKey, "any");
        }

        [Fact]
        public async Task Update_Should_Update_Existing_Setting()
        {
            using var scope = _factory.Services.NewTestScope();
            using var org = await scope.CreateOrganizationAsync();

            scope.Db.OrganizationSettings.Clean();
            await scope.Db.SaveChangesAsync();

            using var setting = await scope
                .CreateOrganizationSettingAsync(org.Entity,
                    OrgSettingsTestRegistryComponent.StringKey,
                    "initial");

            var client = _factory.CreateClient()
                .AuthenticatedAsSuperAdmin();

            await client.CheckSettingReturnedAsync(org,
                OrgSettingsTestRegistryComponent.StringKey, "initial"); // cache current value

            var response = await client
                .PutAsync($"/v3/organizations/{org.Entity.OrganizationId}/settings",
                    new {name = OrgSettingsTestRegistryComponent.StringKey, value = "updated"});

            response.CheckOk();

            var updatedSetting = await scope.Db.OrganizationSettings
                .AsNoTracking()
                .SingleAsync(s => s.OrganizationId == org.Entity.OrganizationId &&
                                  s.Name == OrgSettingsTestRegistryComponent.StringKey);

            Assert.Equal("updated", updatedSetting.Value);

            // check that cache is invalidated
            await client.CheckSettingReturnedAsync(org,
                OrgSettingsTestRegistryComponent.StringKey, "updated");
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("   ")]
        public async Task Update_Should_Remove_Existing_Setting_If_Value_Is_Not_Set(string value)
        {
            using var scope = _factory.Services.NewTestScope();
            var org = await scope.CreateOrganizationAsync();

            scope.Db.OrganizationSettings.Clean();
            scope.Db.OrganizationSettings.Add(new OrganizationSetting
            {
                Organization = org.Entity,
                Name = OrgSettingsTestRegistryComponent.StringKey,
                Value = "initial"
            });
            await scope.Db.SaveChangesAsync();

            var client = _factory.CreateClient()
                .AuthenticatedAsSuperAdmin();

            await client.CheckSettingReturnedAsync(org,
                OrgSettingsTestRegistryComponent.StringKey, "initial"); // cache current value

            var response = await client
                .PutAsync($"/v3/organizations/{org.Entity.OrganizationId}/settings",
                    new {name = OrgSettingsTestRegistryComponent.StringKey, value});

            response.CheckOk();

            Assert.False(await scope.Db.OrganizationSettings
                .AnyAsync(s => s.OrganizationId == org.Entity.OrganizationId &&
                               s.Name == OrgSettingsTestRegistryComponent.StringKey));

            // check that cache is invalidated
            await client.CheckSettingReturnedAsync(org,
                OrgSettingsTestRegistryComponent.StringKey, null);
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("   ")]
        public async Task Update_Should_Do_Nothing_If_Value_Is_Not_Set_And_No_Setting_Exists(string value)
        {
            using var scope = _factory.Services.NewTestScope();
            using var org = await scope.CreateOrganizationAsync();

            scope.Db.OrganizationSettings.Clean();
            await scope.Db.SaveChangesAsync();

            var client = _factory.CreateClient()
                .AuthenticatedAsSuperAdmin();

            var response = await client
                .PutAsync($"/v3/organizations/{org.Entity.OrganizationId}/settings",
                    new {name = OrgSettingsTestRegistryComponent.StringKey, value});

            response.CheckOk();

            Assert.False(await scope.Db.OrganizationSettings
                .AsNoTracking()
                .AnyAsync());
        }
    }

    public static class OrgSettingsTestHttpClientExtensions
    {
        public static async Task CheckSettingReturnedAsync(this HttpClient client,
            IDisposableEntity<Organization> org,
            string name,
            string value)
        {
            var response = await client
                .GetAsync($"/v3/organizations/{org.Entity.OrganizationId}/settings");

            var arr = await response.CheckOk().AsArrayAsync();
            Assert.Contains(arr, t => t.Value<string>("name") == name &&
                                      t.Value<string>("value") == value);
        }
    }
}
