using System;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services;
using Eventuras.TestAbstractions;
using Microsoft.EntityFrameworkCore;
using NodaTime;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Orders
{
    public class OrdersControllerTest : IClassFixture<CustomWebApiApplicationFactory<Startup>>, IDisposable
    {
        private readonly CustomWebApiApplicationFactory<Startup> _factory;

        public OrdersControllerTest(CustomWebApiApplicationFactory<Startup> factory)
        {
            _factory = factory ?? throw new ArgumentNullException(nameof(factory));

            Cleanup();
        }

        public void Dispose()
        {
            Cleanup();
        }

        private void Cleanup()
        {
            using var scope = _factory.Services.NewTestScope();
            scope.Db.Orders.RemoveRange(scope.Db.Orders.ToArray());
            scope.Db.SaveChanges();
        }

        [Fact]
        public async Task List_Should_Require_Auth()
        {
            var client = _factory.CreateClient();
            var response = await client.GetAsync("/v3/orders");
            response.CheckUnauthorized();
        }

        [Fact]
        public async Task List_Should_Return_Empty_List_If_No_Orders()
        {
            var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
            var response = await client.GetAsync("/v3/orders");

            var json = await response.CheckOk().AsTokenAsync();
            json.CheckEmptyPaging();
        }

        [Fact]
        public async Task List_Should_Limit_Orders_For_Regular_User()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var otherUser = await scope.CreateUserAsync();
            using var evt = await scope.CreateEventAsync();
            using var otherEvent = await scope.CreateEventAsync();
            using var r1 = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var r2 = await scope.CreateRegistrationAsync(evt.Entity, otherUser.Entity);
            using var r3 = await scope.CreateRegistrationAsync(otherEvent.Entity, otherUser.Entity);
            using var r4 = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var o1 = await scope.CreateOrderAsync(r1.Entity);
            using var o2 = await scope.CreateOrderAsync(r2.Entity);
            using var o3 = await scope.CreateOrderAsync(r3.Entity);
            using var o4 = await scope.CreateOrderAsync(r4.Entity);

            var client = _factory.CreateClient().AuthenticatedAs(user.Entity);
            var response = await client.GetAsync("/v3/orders");

            var json = await response.CheckOk().AsTokenAsync();
            json.CheckPaging((t, o) => t.CheckOrder(o), o1.Entity, o4.Entity);
        }

        [Fact]
        public async Task List_Should_Limit_Orders_For_Admin()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var admin = await scope.CreateUserAsync(role: Roles.Admin);
            using var org = await scope.CreateOrganizationAsync();
            using var otherOrg = await scope.CreateOrganizationAsync();
            using var member = await scope
                .CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            using var evt = await scope.CreateEventAsync(organization: org.Entity);
            using var otherEvent = await scope.CreateEventAsync(organization: otherOrg.Entity);
            using var r1 = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var r2 = await scope.CreateRegistrationAsync(otherEvent.Entity, user.Entity);
            using var o1 = await scope.CreateOrderAsync(r1.Entity);
            using var o2 = await scope.CreateOrderAsync(r2.Entity);

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);
            var response = await client.GetAsync($"/v3/orders?orgId={org.Entity.OrganizationId}");

            var json = await response.CheckOk().AsTokenAsync();
            json.CheckPaging((t, o) => t.CheckOrder(o), o1.Entity);
        }

        [Theory]
        [InlineData(Roles.SuperAdmin)]
        [InlineData(Roles.SystemAdmin)]
        public async Task List_Should_Not_Limit_Orders_For_Power_Admin(string role)
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var org = await scope.CreateOrganizationAsync();
            using var otherOrg = await scope.CreateOrganizationAsync();
            using var evt = await scope.CreateEventAsync(organization: org.Entity);
            using var otherEvent = await scope.CreateEventAsync(organization: otherOrg.Entity);
            using var r1 = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var r2 = await scope.CreateRegistrationAsync(otherEvent.Entity, user.Entity);
            using var o1 = await scope.CreateOrderAsync(r1.Entity);
            using var o2 = await scope.CreateOrderAsync(r2.Entity);

            var client = _factory.CreateClient().Authenticated(role: role);
            var response = await client.GetAsync($"/v3/orders?orgId={org.Entity.OrganizationId}");

            var json = await response.CheckOk().AsTokenAsync();
            json.CheckPaging((t, o) => t.CheckOrder(o), o1.Entity, o2.Entity);
        }

        [Fact]
        public async Task List_Should_Use_Sorting_And_Paging()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var evt = await scope.CreateEventAsync();
            using var r = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var o1 =
                await scope.CreateOrderAsync(r.Entity, time: SystemClock.Instance.Now().Minus(Duration.FromDays(1)));
            using var o2 =
                await scope.CreateOrderAsync(r.Entity, time: SystemClock.Instance.Now().Minus(Duration.FromDays(2)));
            using var o3 =
                await scope.CreateOrderAsync(r.Entity, time: SystemClock.Instance.Now().Minus(Duration.FromDays(3)));

            var client = _factory.CreateClient().AuthenticatedAs(user.Entity);
            var response = await client.GetAsync("/v3/orders?page=1&count=2");
            var json = await response.CheckOk().AsTokenAsync();
            json.CheckPaging(1, 2, 3, (t, o) => t.CheckOrder(o), o3.Entity, o2.Entity);

            response = await client.GetAsync("/v3/orders?page=2&count=2");
            json = await response.CheckOk().AsTokenAsync();
            json.CheckPaging(2, 2, 3, (t, o) => t.CheckOrder(o), o1.Entity);
        }

        [Fact]
        public async Task List_Should_Support_User_Id_Param()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var otherUser = await scope.CreateUserAsync();
            using var evt = await scope.CreateEventAsync();
            using var r1 = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var r2 = await scope.CreateRegistrationAsync(evt.Entity, otherUser.Entity);
            using var o1 = await scope.CreateOrderAsync(r1.Entity, user: user.Entity);
            using var o2 = await scope.CreateOrderAsync(r2.Entity, user: otherUser.Entity);

            var client = _factory.CreateClient().AuthenticatedAsSuperAdmin();
            var response = await client.GetAsync($"/v3/orders?userId={user.Entity.Id}");
            var json = await response.CheckOk().AsTokenAsync();
            json.CheckPaging((t, o) => t.CheckOrder(o), o1.Entity);

            response = await client.GetAsync($"/v3/orders?userId={otherUser.Entity.Id}");
            json = await response.CheckOk().AsTokenAsync();
            json.CheckPaging((t, o) => t.CheckOrder(o), o2.Entity);
        }

        [Fact]
        public async Task List_Should_Support_Event_Id_Param()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var evt = await scope.CreateEventAsync();
            using var otherEvent = await scope.CreateEventAsync();
            using var r1 = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var r2 = await scope.CreateRegistrationAsync(otherEvent.Entity, user.Entity);
            using var o1 = await scope.CreateOrderAsync(r1.Entity);
            using var o2 = await scope.CreateOrderAsync(r2.Entity);

            var client = _factory.CreateClient().AuthenticatedAsSuperAdmin();
            var response = await client.GetAsync($"/v3/orders?eventId={evt.Entity.EventInfoId}");
            var json = await response.CheckOk().AsTokenAsync();
            json.CheckPaging((t, o) => t.CheckOrder(o), o1.Entity);

            response = await client.GetAsync($"/v3/orders?eventId={otherEvent.Entity.EventInfoId}");
            json = await response.CheckOk().AsTokenAsync();
            json.CheckPaging((t, o) => t.CheckOrder(o), o2.Entity);
        }

        [Fact]
        public async Task List_Should_Support_Registration_Id_Param()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var otherUser = await scope.CreateUserAsync();
            using var evt = await scope.CreateEventAsync();
            using var r1 = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var r2 = await scope.CreateRegistrationAsync(evt.Entity, otherUser.Entity);
            using var o1 = await scope.CreateOrderAsync(r1.Entity, user: user.Entity);
            using var o2 = await scope.CreateOrderAsync(r2.Entity, user: otherUser.Entity);

            var client = _factory.CreateClient().AuthenticatedAsSuperAdmin();
            var response = await client.GetAsync($"/v3/orders?registrationId={r1.Entity.RegistrationId}");
            var json = await response.CheckOk().AsTokenAsync();
            json.CheckPaging((t, o) => t.CheckOrder(o), o1.Entity);

            response = await client.GetAsync($"/v3/orders?registrationId={r2.Entity.RegistrationId}");
            json = await response.CheckOk().AsTokenAsync();
            json.CheckPaging((t, o) => t.CheckOrder(o), o2.Entity);
        }

        [Fact]
        public async Task List_Should_Support_Status_Param()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var otherUser = await scope.CreateUserAsync();
            using var evt = await scope.CreateEventAsync();
            using var r1 = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var r2 = await scope.CreateRegistrationAsync(evt.Entity, otherUser.Entity);
            using var o1 = await scope.CreateOrderAsync(r1.Entity, status: Order.OrderStatus.Verified);
            using var o2 = await scope.CreateOrderAsync(r2.Entity, status: Order.OrderStatus.Cancelled);

            var client = _factory.CreateClient().AuthenticatedAsSuperAdmin();
            var response = await client.GetAsync("/v3/orders?status=verified");
            var json = await response.CheckOk().AsTokenAsync();
            json.CheckPaging((t, o) => t.CheckOrder(o), o1.Entity);

            response = await client.GetAsync("/v3/orders?status=cancelled");
            json = await response.CheckOk().AsTokenAsync();
            json.CheckPaging((t, o) => t.CheckOrder(o), o2.Entity);
        }

        [Fact]
        public async Task List_Should_Support_Include_User_Param()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var otherUser = await scope.CreateUserAsync();
            using var evt = await scope.CreateEventAsync();
            using var r = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var order = await scope.CreateOrderAsync(r.Entity, user: user.Entity);

            var client = _factory.CreateClient().AuthenticatedAsSuperAdmin();
            var response = await client.GetAsync("/v3/orders");
            var json = await response.CheckOk().AsTokenAsync();
            json.CheckPaging((t, o) => t.CheckOrder(o, checkUserNull: true), order.Entity);

            response = await client.GetAsync("/v3/orders?includeUser=false");
            json = await response.CheckOk().AsTokenAsync();
            json.CheckPaging((t, o) => t.CheckOrder(o, checkUserNull: true), order.Entity);

            response = await client.GetAsync("/v3/orders?includeUser=true");
            json = await response.CheckOk().AsTokenAsync();
            json.CheckPaging((t, o) => t.CheckOrder(o, checkUser: true), order.Entity);
        }

        [Fact]
        public async Task List_Should_Support_Include_Registration_Param()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var otherUser = await scope.CreateUserAsync();
            using var evt = await scope.CreateEventAsync();
            using var r = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var order = await scope.CreateOrderAsync(r.Entity, user: user.Entity);

            var client = _factory.CreateClient().AuthenticatedAsSuperAdmin();
            var response = await client.GetAsync("/v3/orders");
            var json = await response.CheckOk().AsTokenAsync();
            json.CheckPaging((t, o) => t.CheckOrder(o, checkRegistrationNull: true), order.Entity);

            response = await client.GetAsync("/v3/orders?includeRegistration=false");
            json = await response.CheckOk().AsTokenAsync();
            json.CheckPaging((t, o) => t.CheckOrder(o, checkRegistrationNull: true), order.Entity);

            response = await client.GetAsync("/v3/orders?includeRegistration=true");
            json = await response.CheckOk().AsTokenAsync();
            json.CheckPaging((t, o) => t.CheckOrder(o, checkRegistration: true), order.Entity);
        }

        [Fact]
        public async Task List_Should_Return_Full_Info()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var otherUser = await scope.CreateUserAsync();
            using var evt = await scope.CreateEventAsync();
            using var r = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var p = await scope.CreateProductAsync(evt.Entity);
            using var v = await scope.CreateProductVariantAsync(p.Entity);
            using var order = await scope.CreateOrderAsync(r.Entity, user: user.Entity,
                product: p.Entity, variant: v.Entity);

            var client = _factory.CreateClient().AuthenticatedAsSuperAdmin();
            var response = await client.GetAsync("/v3/orders?includeUser=true&includeRegistration=true");
            var json = await response.CheckOk().AsTokenAsync();
            json.CheckPaging((t, o) => t.CheckOrder(o,
                checkUser: true, checkRegistration: true, checkItems: true), order.Entity);
        }

        [Fact]
        public async Task Cancel_Should_Require_Auth()
        {
            var client = _factory.CreateClient();
            var response = await client.DeleteAsync("/v3/orders/10001");
            response.CheckUnauthorized();
        }

        [Fact]
        public async Task Cancel_Should_Return_NotFound_If_Order_Not_Exists()
        {
            var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
            var response = await client.DeleteAsync("/v3/orders/10001");
            response.CheckNotFound();
        }

        [Fact]
        public async Task Should_Allow_To_Cancel_Own_Order()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var evt = await scope.CreateEventAsync();
            using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var order = await scope.CreateOrderAsync(reg.Entity);

            var client = _factory.CreateClient().AuthenticatedAs(user.Entity);
            var response = await client.DeleteAsync($"/v3/orders/{order.Entity.OrderId}");
            response.CheckOk();

            await CheckOrderCancelledAsync(scope, order);
        }

        private static async Task CheckOrderCancelledAsync(TestServiceScope scope, IDisposableEntity<Order> order)
        {
            var updatedOrder = await scope.Db.Orders
                .AsNoTracking()
                .SingleAsync(o => o.OrderId == order.Entity.OrderId);

            Assert.Equal(Order.OrderStatus.Cancelled, updatedOrder.Status);
        }

        [Fact]
        public async Task Should_Not_Allow_To_Cancel_Someone_Elses_Order_For_Regular_User()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var otherUser = await scope.CreateUserAsync();
            using var evt = await scope.CreateEventAsync();
            using var reg = await scope.CreateRegistrationAsync(evt.Entity, otherUser.Entity);
            using var order = await scope.CreateOrderAsync(reg.Entity);

            var client = _factory.CreateClient().AuthenticatedAs(user.Entity);
            var response = await client.DeleteAsync($"/v3/orders/{order.Entity.OrderId}");
            response.CheckForbidden();
        }

        [Fact]
        public async Task Should_Allow_To_Cancel_Order_For_Org_Admin()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var admin = await scope.CreateUserAsync(role: Roles.Admin);
            using var org = await scope.CreateOrganizationAsync();
            using var member = await scope
                .CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            using var evt = await scope.CreateEventAsync(organization: org.Entity);
            using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var order = await scope.CreateOrderAsync(reg.Entity);

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);
            var response =
                await client.DeleteAsync($"/v3/orders/{order.Entity.OrderId}?orgId={org.Entity.OrganizationId}");
            response.CheckOk();

            await CheckOrderCancelledAsync(scope, order);
        }

        [Fact]
        public async Task Should_Not_Allow_To_Cancel_Order_For_Org_Admin_Event_Related_To_Other_Org()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var admin = await scope.CreateUserAsync(role: Roles.Admin);
            using var org = await scope.CreateOrganizationAsync();
            using var otherOrg = await scope.CreateOrganizationAsync();
            using var member = await scope
                .CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            using var evt = await scope.CreateEventAsync(organization: otherOrg.Entity);
            using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var order = await scope.CreateOrderAsync(reg.Entity);

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);
            var response =
                await client.DeleteAsync($"/v3/orders/{order.Entity.OrderId}?orgId={org.Entity.OrganizationId}");
            response.CheckForbidden();
        }

        [Theory]
        [InlineData(Roles.SuperAdmin)]
        [InlineData(Roles.SystemAdmin)]
        public async Task Should_Allow_To_Cancel_Any_Order_For_Power_Admin(string role)
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var admin = await scope.CreateUserAsync(role: Roles.Admin);
            using var evt = await scope.CreateEventAsync();
            using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var order = await scope.CreateOrderAsync(reg.Entity);

            var client = _factory.CreateClient().Authenticated(role: role);
            var response = await client.DeleteAsync($"/v3/orders/{order.Entity.OrderId}");
            response.CheckOk();

            await CheckOrderCancelledAsync(scope, order);
        }

        [Fact]
        public async Task Get_Should_Require_Auth()
        {
            var client = _factory.CreateClient();
            var response = await client.GetAsync("/v3/orders/10001");
            response.CheckUnauthorized();
        }

        [Fact]
        public async Task Get_Should_Return_NotFound_If_Order_Not_Exists()
        {
            var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
            var response = await client.GetAsync("/v3/orders/10001");
            response.CheckNotFound();
        }

        [Fact]
        public async Task Should_Return_Own_Order()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var evt = await scope.CreateEventAsync();
            using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var order = await scope.CreateOrderAsync(reg.Entity);

            var client = _factory.CreateClient().AuthenticatedAs(user.Entity);
            var response = await client.GetAsync($"/v3/orders/{order.Entity.OrderId}");
            var json = await response.CheckOk().AsTokenAsync();
            json.CheckOrder(order.Entity);
        }

        [Fact]
        public async Task Should_Not_Return_Someone_Elses_Order_For_Regular_User()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var otherUser = await scope.CreateUserAsync();
            using var evt = await scope.CreateEventAsync();
            using var reg = await scope.CreateRegistrationAsync(evt.Entity, otherUser.Entity);
            using var order = await scope.CreateOrderAsync(reg.Entity, user: otherUser.Entity);

            var client = _factory.CreateClient().AuthenticatedAs(user.Entity);
            var response = await client.GetAsync($"/v3/orders/{order.Entity.OrderId}");
            response.CheckForbidden();
        }

        [Fact]
        public async Task Should_Return_Order_Related_To_Admin_Org()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var admin = await scope.CreateUserAsync(role: Roles.Admin);
            using var org = await scope.CreateOrganizationAsync();
            using var member = await scope
                .CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            using var evt = await scope.CreateEventAsync(organization: org.Entity);
            using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var order = await scope.CreateOrderAsync(reg.Entity);

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);
            var response =
                await client.GetAsync($"/v3/orders/{order.Entity.OrderId}?orgId={org.Entity.OrganizationId}");
            var json = await response.CheckOk().AsTokenAsync();
            json.CheckOrder(order.Entity);
        }

        [Fact]
        public async Task Should_Not_Return_Order_Not_Related_To_Admin_Org()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var admin = await scope.CreateUserAsync(role: Roles.Admin);
            using var org = await scope.CreateOrganizationAsync();
            using var otherOrg = await scope.CreateOrganizationAsync();
            using var member = await scope
                .CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            using var evt = await scope.CreateEventAsync(organization: otherOrg.Entity);
            using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var order = await scope.CreateOrderAsync(reg.Entity);

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);
            var response =
                await client.GetAsync($"/v3/orders/{order.Entity.OrderId}?orgId={otherOrg.Entity.OrganizationId}");
            response.CheckForbidden();
        }

        [Theory]
        [InlineData(Roles.SuperAdmin)]
        [InlineData(Roles.SystemAdmin)]
        public async Task Should_Return_Any_Order_For_Power_Admin(string role)
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var evt = await scope.CreateEventAsync();
            using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var order = await scope.CreateOrderAsync(reg.Entity);

            var client = _factory.CreateClient().Authenticated(role: role);
            var response = await client.GetAsync($"/v3/orders/{order.Entity.OrderId}");
            var json = await response.CheckOk().AsTokenAsync();
            json.CheckOrder(order.Entity);
        }

        [Fact]
        public async Task Get_Should_Support_IncludeUser_Param()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var evt = await scope.CreateEventAsync();
            using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var order = await scope.CreateOrderAsync(reg.Entity);

            var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
            var response = await client.GetAsync($"/v3/orders/{order.Entity.OrderId}");
            var json = await response.CheckOk().AsTokenAsync();
            json.CheckOrder(order.Entity, checkUserNull: true);

            response = await client.GetAsync($"/v3/orders/{order.Entity.OrderId}?includeUser=false");
            json = await response.CheckOk().AsTokenAsync();
            json.CheckOrder(order.Entity, checkUserNull: true);

            response = await client.GetAsync($"/v3/orders/{order.Entity.OrderId}?includeUser=true");
            json = await response.CheckOk().AsTokenAsync();
            json.CheckOrder(order.Entity, checkUser: true);
        }

        [Fact]
        public async Task Get_Should_Support_IncludeRegistration_Param()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var evt = await scope.CreateEventAsync();
            using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var order = await scope.CreateOrderAsync(reg.Entity);

            var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
            var response = await client.GetAsync($"/v3/orders/{order.Entity.OrderId}");
            var json = await response.CheckOk().AsTokenAsync();
            json.CheckOrder(order.Entity, checkRegistrationNull: true);

            response = await client.GetAsync($"/v3/orders/{order.Entity.OrderId}?includeRegistration=false");
            json = await response.CheckOk().AsTokenAsync();
            json.CheckOrder(order.Entity, checkRegistrationNull: true);

            response = await client.GetAsync($"/v3/orders/{order.Entity.OrderId}?includeRegistration=true");
            json = await response.CheckOk().AsTokenAsync();
            json.CheckOrder(order.Entity, checkRegistration: true);
        }

        [Fact]
        public async Task Get_Should_Return_Max_Data()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var evt = await scope.CreateEventAsync();
            using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var p = await scope.CreateProductAsync(evt.Entity);
            using var v = await scope.CreateProductVariantAsync(p.Entity);
            using var order = await scope.CreateOrderAsync(reg.Entity, product: p.Entity, variant: v.Entity);

            var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
            var response =
                await client.GetAsync($"/v3/orders/{order.Entity.OrderId}?includeUser=true&includeRegistration=true");
            var json = await response.CheckOk().AsTokenAsync();
            json.CheckOrder(order.Entity, checkUser: true, checkRegistration: true);
        }

        [Fact]
        public async Task Should_Require_Auth_To_Update_Order()
        {
            var response = await _factory.CreateClient()
                .PutAsync($"/v3/orders/{Guid.NewGuid()}");

            response.CheckUnauthorized();
        }

        [Fact]
        public async Task Should_Return_Not_Found_When_Updating_Non_Existing_Order()
        {
            var response = await _factory.CreateClient()
                .AuthenticatedAsSystemAdmin()
                .PutAsync($"/v3/orders/10001", new
                {
                    lines = new[]
                    {
                        new
                        {
                            productId = 1,
                            quantity = 1
                        }
                    }
                });

            response.CheckNotFound();
        }

        [Fact]
        public async Task Should_Not_Allow_To_Set_Quantity_Below_Min()
        {
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync();
            using var user = await scope.CreateUserAsync();
            using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var p = await scope.CreateProductAsync(evt.Entity, minimumQuantity: 2, name: "Test");
            using var v = await scope.CreateProductVariantAsync(p.Entity);
            using var order = await scope.CreateOrderAsync(reg.Entity, product: p.Entity, variant: v.Entity);

            var response = await _factory
                .CreateClient()
                .AuthenticatedAsSystemAdmin()
                .PutAsync($"/v3/orders/{order.Entity.OrderId}", new
                {
                    lines = new[]
                    {
                        new
                        {
                            productId = p.Entity.ProductId,
                            quantity = 1
                        }
                    }
                });

            await response.CheckBadRequestAsync("Product Test's min quantity is 2 but 1 was given");
        }

        [Fact]
        public async Task Should_Allow_Regular_User_To_Update_Own_Order()
        {
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync();
            using var user = await scope.CreateUserAsync();
            using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var p = await scope.CreateProductAsync(evt.Entity);
            using var p2 = await scope.CreateProductAsync(evt.Entity);
            using var v = await scope.CreateProductVariantAsync(p.Entity);
            using var order = await scope.CreateOrderAsync(reg.Entity, product: p.Entity, variant: v.Entity);

            var response = await _factory
                .CreateClient()
                .AuthenticatedAs(user.Entity)
                .PutAsync($"/v3/orders/{order.Entity.OrderId}",
                    GetOrderUpdateData(p, v, p2));

            response.CheckOk();

            var updatedOrder = await CheckOrderUpdatedAsync(scope, order, p, v, p2);
            var content = await response.AsTokenAsync();
            content.CheckOrder(updatedOrder);
        }

        private static object GetOrderUpdateData(
            IDisposableEntity<Product> p,
            IDisposableEntity<ProductVariant> v,
            IDisposableEntity<Product> p2)
        {
            return new
            {
                lines = new[]
                {
                    new
                    {
                        productId = p.Entity.ProductId,
                        productVariantId = v.Entity.ProductVariantId as int?,
                        quantity = 2
                    },
                    new
                    {
                        productId = p2.Entity.ProductId,
                        productVariantId = (int?)null,
                        quantity = 1
                    }
                }
            };
        }

        [Fact]
        public async Task Should_Not_Allow_Regular_User_To_Update_Someone_Elses_Order()
        {
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync();
            using var user = await scope.CreateUserAsync();
            using var otherUser = await scope.CreateUserAsync();
            using var reg = await scope.CreateRegistrationAsync(evt.Entity, otherUser.Entity);
            using var p = await scope.CreateProductAsync(evt.Entity);
            using var v = await scope.CreateProductVariantAsync(p.Entity);
            using var order = await scope.CreateOrderAsync(reg.Entity, p.Entity, v.Entity);

            var response = await _factory
                .CreateClient()
                .AuthenticatedAs(user.Entity)
                .PutAsync($"/v3/orders/{order.Entity.OrderId}", new
                {
                    lines = new[]
                    {
                        new
                        {
                            productId = p.Entity.ProductId,
                            productVariantId = v.Entity.ProductVariantId,
                            quantity = 1
                        }
                    }
                });

            response.CheckForbidden();
        }

        [Fact]
        public async Task Should_Allow_To_Update_Order_For_Admin()
        {
            using var scope = _factory.Services.NewTestScope();
            using var admin = await scope.CreateUserAsync(role: Roles.Admin);
            using var org = await scope.CreateOrganizationAsync();
            using var member = await scope
                .CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            using var evt = await scope.CreateEventAsync(organization: org.Entity);
            using var user = await scope.CreateUserAsync();
            using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var p = await scope.CreateProductAsync(evt.Entity);
            using var p2 = await scope.CreateProductAsync(evt.Entity);
            using var v = await scope.CreateProductVariantAsync(p.Entity);
            using var order = await scope.CreateOrderAsync(reg.Entity, product: p.Entity, variant: v.Entity);

            var response = await _factory
                .CreateClient()
                .AuthenticatedAs(admin.Entity, Roles.Admin)
                .PutAsync($"/v3/orders/{order.Entity.OrderId}?orgId={org.Entity.OrganizationId}",
                    GetOrderUpdateData(p, v, p2));

            response.CheckOk();

            var updatedOrder = await CheckOrderUpdatedAsync(scope, order, p, v, p2);
            var json = await response.AsTokenAsync();
            json.CheckOrder(updatedOrder);
        }

        private static async Task<Order> CheckOrderUpdatedAsync(
            TestServiceScope scope,
            IDisposableEntity<Order> order,
            IDisposableEntity<Product> p,
            IDisposableEntity<ProductVariant> v,
            IDisposableEntity<Product> p2)
        {
            var updatedOrder = await scope.Db.Orders
                .AsNoTracking()
                .Include(o => o.OrderLines)
                .FirstOrDefaultAsync(o => o.OrderId == order.Entity.OrderId);

            Assert.Equal(2, updatedOrder.OrderLines.Count);

            var firstLine = updatedOrder.OrderLines.First();
            Assert.Equal(p.Entity.ProductId, firstLine.ProductId);
            Assert.Equal(v.Entity.ProductVariantId, firstLine.ProductVariantId);
            Assert.Equal(2, firstLine.Quantity);

            var secondLine = updatedOrder.OrderLines.Last();
            Assert.Equal(p2.Entity.ProductId, secondLine.ProductId);
            Assert.Null(secondLine.ProductVariantId);
            Assert.Equal(1, secondLine.Quantity);

            return updatedOrder;
        }

        [Fact]
        public async Task Should_Not_Allow_Admin_To_Update_Order_From_Other_Org()
        {
            using var scope = _factory.Services.NewTestScope();
            using var admin = await scope.CreateUserAsync(role: Roles.Admin);
            using var org = await scope.CreateOrganizationAsync();
            using var otherOrg = await scope.CreateOrganizationAsync();
            using var member = await scope
                .CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
            using var evt = await scope.CreateEventAsync(organization: otherOrg.Entity);
            using var user = await scope.CreateUserAsync();
            using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var p = await scope.CreateProductAsync(evt.Entity);
            using var p2 = await scope.CreateProductAsync(evt.Entity);
            using var v = await scope.CreateProductVariantAsync(p.Entity);
            using var order = await scope.CreateOrderAsync(reg.Entity, product: p.Entity, variant: v.Entity);

            var response = await _factory
                .CreateClient()
                .AuthenticatedAs(admin.Entity, Roles.Admin)
                .PutAsync($"/v3/orders/{order.Entity.OrderId}?orgId={org.Entity.OrganizationId}",
                    GetOrderUpdateData(p, v, p2));

            response.CheckForbidden();
        }

        [Theory]
        [InlineData(Roles.SuperAdmin)]
        [InlineData(Roles.SystemAdmin)]
        public async Task Should_Allow_Power_Admin_To_Update_Any_Order(string role)
        {
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync();
            using var user = await scope.CreateUserAsync();
            using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var p = await scope.CreateProductAsync(evt.Entity);
            using var p2 = await scope.CreateProductAsync(evt.Entity);
            using var v = await scope.CreateProductVariantAsync(p.Entity);
            using var order = await scope.CreateOrderAsync(reg.Entity, product: p.Entity, variant: v.Entity);

            var response = await _factory
                .CreateClient()
                .Authenticated(role: role)
                .PutAsync($"/v3/orders/{order.Entity.OrderId}",
                    GetOrderUpdateData(p, v, p2));

            response.CheckOk();

            var updatedOrder = await CheckOrderUpdatedAsync(scope, order, p, v, p2);
            var json = await response.AsTokenAsync();
            json.CheckOrder(updatedOrder);
        }

        [Theory]
        [InlineData(Order.OrderStatus.Draft)]
        [InlineData(Order.OrderStatus.Verified)]
        public async Task Should_Allow_To_Update_Order_In_Status(Order.OrderStatus status)
        {
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync();
            using var user = await scope.CreateUserAsync();
            using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var p = await scope.CreateProductAsync(evt.Entity);
            using var p2 = await scope.CreateProductAsync(evt.Entity);
            using var v = await scope.CreateProductVariantAsync(p.Entity);
            using var order =
                await scope.CreateOrderAsync(reg.Entity, product: p.Entity, variant: v.Entity, status: status);

            var response = await _factory
                .CreateClient()
                .AuthenticatedAsSystemAdmin()
                .PutAsync($"/v3/orders/{order.Entity.OrderId}",
                    GetOrderUpdateData(p, v, p2));

            response.CheckOk();

            var updatedOrder = await CheckOrderUpdatedAsync(scope, order, p, v, p2);
            var json = await response.AsTokenAsync();
            json.CheckOrder(updatedOrder);
        }

        [Theory]
        [InlineData(Order.OrderStatus.Invoiced)]
        [InlineData(Order.OrderStatus.Refunded)]
        [InlineData(Order.OrderStatus.Cancelled)]
        public async Task Should_Not_Allow_To_Update_Order_In_Status(Order.OrderStatus status)
        {
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync();
            using var user = await scope.CreateUserAsync();
            using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
            using var p = await scope.CreateProductAsync(evt.Entity);
            using var p2 = await scope.CreateProductAsync(evt.Entity);
            using var v = await scope.CreateProductVariantAsync(p.Entity);
            using var order =
                await scope.CreateOrderAsync(reg.Entity, product: p.Entity, variant: v.Entity, status: status);

            var response = await _factory
                .CreateClient()
                .AuthenticatedAsSystemAdmin()
                .PutAsync($"/v3/orders/{order.Entity.OrderId}",
                    GetOrderUpdateData(p, v, p2));

            await response.CheckBadRequestAsync(
                $"Order {order.Entity.OrderId} cannot be updated being in {status} status");
        }
    }
}
