using System;
using System.Threading.Tasks;
using Eventuras.Services;
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
            // TODO: implement!
        }

        [Fact]
        public async Task List_Should_Require_Admin_Role()
        {
            // TODO: implement!
        }

        [Fact]
        public async Task List_Should_Not_Be_Available_To_Other_Org_Admin()
        {
            // TODO: implement!
        }

        [Fact]
        public async Task List_Should_Return_Not_Found_If_No_Org_Exists()
        {
            // TODO: implement!
        }

        [Fact]
        public async Task List_Should_Return_Settings_For_Org_Admin()
        {
            // TODO: implement!
        }

        [Theory]
        [InlineData(Roles.SuperAdmin)]
        [InlineData(Roles.SystemAdmin)]
        public async Task List_Should_Return_Settings_For_Power_Admin(string role)
        {
            // TODO: implement!
        }

        [Fact]
        public async Task List_Should_Use_Cache()
        {
            // TODO: implement!
        }

        [Fact]
        public async Task Update_Should_Require_Auth()
        {
            // TODO: implement!
        }

        [Fact]
        public async Task Update_Should_Require_Admin_Role()
        {
            // TODO: implement!
        }

        [Fact]
        public async Task Update_Should_Not_Be_Available_To_Other_Org_Admin()
        {
            // TODO: implement!
        }

        [Fact]
        public async Task Update_Should_Be_Available_To_Org_Admin()
        {
            // TODO: implement!
        }

        [Fact]
        public async Task Update_Should_Be_Available_To_Power_Admin()
        {
            // TODO: implement!
        }

        [Fact]
        public async Task Update_Should_Return_Not_Found_If_No_Org_Exists()
        {
            // TODO: implement!
        }

        [Fact]
        public async Task Update_Should_Return_Not_Found_If_No_Setting_Registered()
        {
            // TODO: implement!
        }

        [Fact]
        public async Task Update_Should_Add_New_Setting_If_Not_Exists()
        {
            // TODO: implement!
            // TODO: check that cache is invalidated!
        }

        [Fact]
        public async Task Update_Should_Update_Existing_Setting()
        {
            // TODO: implement!
            // TODO: check that cache is invalidated!
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("   ")]
        public async Task Update_Should_Remove_Existing_Setting_If_Value_Is_Not_Set(string value)
        {
            // TODO: implement!
            // TODO: check that cache is invalidated!
        }

        [Fact]
        public async Task Update_Should_Do_Nothing_If_Value_Is_Not_Set_And_No_Setting_Exists()
        {
            // TODO: implement!
        }
    }
}
