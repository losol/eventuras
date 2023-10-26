using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services;
using Eventuras.TestAbstractions;
using System;
using System.Threading.Tasks;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Notifications
{
    public class NotificationsControllerTest : IClassFixture<CustomWebApiApplicationFactory<Startup>>
    {
        private readonly CustomWebApiApplicationFactory<Startup> _factory;

        public NotificationsControllerTest(CustomWebApiApplicationFactory<Startup> factory)
        {
            _factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        [Fact]
        public async Task Should_Require_Auth_For_Getting_Notification()
        {
            var client = _factory.CreateClient();
            var response = await client.GetAsync("/v3/notifications/1");
            response.CheckUnauthorized();
        }

        [Fact]
        public async Task Should_Return_Not_Found_When_Getting_Unknown_Notification()
        {
            var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
            var response = await client.GetAsync("/v3/notifications/1");
            response.CheckNotFound();
        }

        [Fact]
        public async Task Should_Not_Allow_To_Get_Inaccessible_Notification_For_Regular_User()
        {
            var client = _factory.CreateClient().Authenticated();
            using var scope = _factory.Services.NewTestScope();
            using var notification = await scope.CreateEmailNotificationAsync();
            var response = await client.GetAsync($"/v3/notifications/{notification.Entity.NotificationId}");
            response.CheckForbidden();
        }

        [Fact]
        public async Task Should_Not_Allow_To_Get_Inaccessible_Notification_For_Org_Admin()
        {
            using var scope = _factory.Services.NewTestScope();
            using var admin = await scope.CreateUserAsync();
            using var org = await scope.CreateOrganizationAsync();
            using var member = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity);
            using var notification = await scope.CreateEmailNotificationAsync();

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);
            var response = await client.GetAsync($"/v3/notifications/{notification.Entity.NotificationId}", new
            {
                orgId = org.Entity.OrganizationId
            });
            response.CheckForbidden();
        }

        [Fact]
        public async Task Should_Not_Allow_To_Get_Inaccessible_Org_Notification_For_Org_Admin()
        {
            using var scope = _factory.Services.NewTestScope();
            using var admin = await scope.CreateUserAsync();
            using var org = await scope.CreateOrganizationAsync();
            using var org2 = await scope.CreateOrganizationAsync();
            using var member = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity);
            using var notification = await scope.CreateEmailNotificationAsync(organization: org2.Entity);

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);
            var response = await client.GetAsync($"/v3/notifications/{notification.Entity.NotificationId}", new
            {
                orgId = org.Entity.OrganizationId
            });
            response.CheckForbidden();
        }

        [Fact]
        public async Task Should_Not_Allow_To_Get_Inaccessible_Event_Notification_For_Org_Admin()
        {
            using var scope = _factory.Services.NewTestScope();
            using var admin = await scope.CreateUserAsync();
            using var org = await scope.CreateOrganizationAsync();
            using var org2 = await scope.CreateOrganizationAsync();
            using var member = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity);
            using var evt = await scope.CreateEventAsync(organization: org2.Entity);
            using var notification = await scope.CreateEmailNotificationAsync(eventInfo: evt.Entity);

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);
            var response = await client.GetAsync($"/v3/notifications/{notification.Entity.NotificationId}", new
            {
                orgId = org.Entity.OrganizationId
            });
            response.CheckForbidden();
        }

        [Fact]
        public async Task Should_Allow_To_Get_Accessible_Notification_For_Org_Admin()
        {
            using var scope = _factory.Services.NewTestScope();
            using var admin = await scope.CreateUserAsync();
            using var org = await scope.CreateOrganizationAsync();
            using var member = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity);
            using var notification = await scope.CreateEmailNotificationAsync(organization: org.Entity);

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);
            var response = await client.GetAsync($"/v3/notifications/{notification.Entity.NotificationId}", new
            {
                orgId = org.Entity.OrganizationId
            });

            var json = await response.CheckOk().AsTokenAsync();
            json.CheckNotification(notification.Entity);
        }

        [Fact]
        public async Task Should_Allow_To_Get_Accessible_Event_Notification_For_Org_Admin()
        {
            using var scope = _factory.Services.NewTestScope();
            using var admin = await scope.CreateUserAsync();
            using var org = await scope.CreateOrganizationAsync();
            using var member = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity);
            using var evt = await scope.CreateEventAsync(organization: org.Entity);
            using var notification = await scope.CreateEmailNotificationAsync(eventInfo: evt.Entity);

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);
            var response = await client.GetAsync($"/v3/notifications/{notification.Entity.NotificationId}", new
            {
                orgId = org.Entity.OrganizationId
            });

            var json = await response.CheckOk().AsTokenAsync();
            json.CheckNotification(notification.Entity);
        }

        [Theory]
        [InlineData(Roles.SystemAdmin)]
        [InlineData(Roles.SuperAdmin)]
        public async Task Should_Allow_To_Get_Any_Notification_For_Power_Admin(string role)
        {
            using var scope = _factory.Services.NewTestScope();
            using var notification = await scope.CreateEmailNotificationAsync();

            var client = _factory.CreateClient().Authenticated(role: role);
            var response = await client.GetAsync($"/v3/notifications/{notification.Entity.NotificationId}");

            var json = await response.CheckOk().AsTokenAsync();
            json.CheckNotification(notification.Entity);
        }

        [Fact]
        public async Task Should_Use_Include_Stats_Query_Param_When_Getting_Single_Notification_Data()
        {
            using var scope = _factory.Services.NewTestScope();
            using var notification = await scope
                .CreateEmailNotificationAsync(totalSent: 10, totalErrors: 2);

            var client = _factory.CreateClient().AuthenticatedAsSuperAdmin();
            var response = await client.GetAsync($"/v3/notifications/{notification.Entity.NotificationId}", new
            {
                includeStatistics = true
            });

            var json = await response.CheckOk().AsTokenAsync();
            json.CheckNotification(notification.Entity, 10, 2);
        }

        [Fact]
        public async Task List_Should_Require_Auth()
        {
            var client = _factory.CreateClient();
            var response = await client.GetAsync("/v3/notifications");
            response.CheckUnauthorized();
        }

        [Fact]
        public async Task List_Should_Limit_Output_For_Non_Admin()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var n1 = await scope.CreateEmailNotificationAsync(recipientUsers: new[] { user.Entity });
            using var n2 = await scope.CreateEmailNotificationAsync();

            var client = _factory.CreateClient().AuthenticatedAs(user.Entity);
            var response = await client.GetAsync("/v3/notifications");

            var token = await response.CheckOk().AsTokenAsync();
            token.CheckPaging((t, n) => t.CheckNotification(n), n1.Entity);
        }

        [Fact]
        public async Task List_Should_Limit_Output_For_Org_Admin()
        {
            using var scope = _factory.Services.NewTestScope();
            using var admin = await scope.CreateUserAsync();
            using var o1 = await scope.CreateOrganizationAsync();
            using var o2 = await scope.CreateOrganizationAsync();
            using var member = await scope.CreateOrganizationMemberAsync(admin.Entity, o1.Entity);
            using var e1 = await scope.CreateEventAsync(organization: o1.Entity);
            using var e2 = await scope.CreateEventAsync(organization: o2.Entity);
            using var n1 =
                await scope.CreateEmailNotificationAsync(organization: o1.Entity);
            using var n2 =
                await scope.CreateEmailNotificationAsync(eventInfo: e1.Entity);
            using var n3 = await scope.CreateEmailNotificationAsync(eventInfo: e2.Entity);
            using var n4 = await scope.CreateEmailNotificationAsync();

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);
            var response = await client.GetAsync("/v3/notifications", new
            {
                orgId = o1.Entity.OrganizationId
            });

            var token = await response.CheckOk().AsTokenAsync();
            token.CheckPaging((t, n) => t.CheckNotification(n), n2.Entity, n1.Entity);
        }

        [Theory]
        [InlineData(Roles.SuperAdmin)]
        [InlineData(Roles.SystemAdmin)]
        public async Task List_Should_Not_Limit_Output_For_Power_Admin(string role)
        {
            using var scope = _factory.Services.NewTestScope();
            using var o1 = await scope.CreateOrganizationAsync();
            using var o2 = await scope.CreateOrganizationAsync();
            using var e1 = await scope.CreateEventAsync(organization: o1.Entity);
            using var e2 = await scope.CreateEventAsync(organization: o2.Entity);
            using var n1 = await scope.CreateEmailNotificationAsync(organization: o1.Entity);
            using var n2 = await scope.CreateEmailNotificationAsync(eventInfo: e1.Entity);
            using var n3 = await scope.CreateEmailNotificationAsync(eventInfo: e2.Entity);
            using var n4 = await scope.CreateEmailNotificationAsync();

            var client = _factory.CreateClient().Authenticated(role: role);
            var response = await client.GetAsync("/v3/notifications");

            var token = await response.CheckOk().AsTokenAsync();
            token.CheckPaging((t, n) => t.CheckNotification(n),
                n4.Entity, n3.Entity, n2.Entity, n1.Entity);
        }

        [Theory]
        [MemberData(nameof(GetInvalidListQueryParams))]
        public async Task List_Should_Check_Query_Params_Validity(object queryParams)
        {
            var client = _factory.CreateClient()
                .AuthenticatedAsSystemAdmin();

            var response = await client.GetAsync("/v3/notifications", queryParams);
            response.CheckBadRequest();
        }

        public static object[][] GetInvalidListQueryParams()
        {
            return new[]
            {
                new object[] { new { page = "invalid" } },
                new object[] { new { page = -1 } },
                new object[] { new { page = 0 } },
                new object[] { new { count = "invalid" } },
                new object[] { new { count = -1 } },
                new object[] { new { eventId = "invalid" } },
                new object[] { new { eventId = 0 } },
                new object[] { new { productId = "invalid" } },
                new object[] { new { productId = 0 } },
                new object[] { new { status = "invalid" } },
                new object[] { new { type = "invalid" } },
                new object[] { new { order = "invalid" } },
                new object[] { new { desc = "invalid" } }
            };
        }

        [Fact]
        public async Task List_Should_Use_EventId_Query_Params()
        {
            using var scope = _factory.Services.NewTestScope();
            using var e1 = await scope.CreateEventAsync();
            using var e2 = await scope.CreateEventAsync();
            using var n1 = await scope.CreateEmailNotificationAsync(eventInfo: e1.Entity);
            using var n2 = await scope.CreateEmailNotificationAsync(eventInfo: e2.Entity);
            using var n3 = await scope.CreateEmailNotificationAsync();

            var client = _factory.CreateClient().AuthenticatedAsSuperAdmin();
            var response = await client.GetAsync($"/v3/notifications?eventId={e1.Entity.EventInfoId}");
            var token = await response.CheckOk().AsTokenAsync();
            token.CheckPaging((t, n) => t.CheckNotification(n), n1.Entity);

            response = await client.GetAsync($"/v3/notifications?eventId={e2.Entity.EventInfoId}");
            token = await response.CheckOk().AsTokenAsync();
            token.CheckPaging((t, n) => t.CheckNotification(n), n2.Entity);
        }

        [Fact]
        public async Task List_Should_Use_ProductId_Query_Params()
        {
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync();
            using var p1 = await scope.CreateProductAsync(evt.Entity);
            using var p2 = await scope.CreateProductAsync(evt.Entity);
            using var n1 = await scope.CreateEmailNotificationAsync(product: p1.Entity);
            using var n2 = await scope.CreateEmailNotificationAsync(product: p2.Entity);
            using var n3 = await scope.CreateEmailNotificationAsync();

            var client = _factory.CreateClient().AuthenticatedAsSuperAdmin();
            var response = await client.GetAsync($"/v3/notifications?productId={p1.Entity.ProductId}");
            var token = await response.CheckOk().AsTokenAsync();
            token.CheckPaging((t, n) => t.CheckNotification(n), n1.Entity);

            response = await client.GetAsync($"/v3/notifications?productId={p2.Entity.ProductId}");
            token = await response.CheckOk().AsTokenAsync();
            token.CheckPaging((t, n) => t.CheckNotification(n), n2.Entity);
        }

        [Fact]
        public async Task List_Should_Use_Status_Query_Params()
        {
            using var scope = _factory.Services.NewTestScope();
            using var n1 = await scope.CreateEmailNotificationAsync(status: NotificationStatus.Sent);
            using var n2 = await scope.CreateEmailNotificationAsync(status: NotificationStatus.Cancelled);
            using var n3 = await scope.CreateEmailNotificationAsync();

            var client = _factory.CreateClient().AuthenticatedAsSuperAdmin();
            var response = await client.GetAsync("/v3/notifications?status=sent");
            var token = await response.CheckOk().AsTokenAsync();
            token.CheckPaging((t, n) => t.CheckNotification(n), n1.Entity);

            response = await client.GetAsync("/v3/notifications?status=cancelled");
            token = await response.CheckOk().AsTokenAsync();
            token.CheckPaging((t, n) => t.CheckNotification(n), n2.Entity);
        }

        [Fact]
        public async Task List_Should_Use_Type_Query_Params()
        {
            using var scope = _factory.Services.NewTestScope();
            using var n1 = await scope.CreateEmailNotificationAsync();
            using var n2 = await scope.CreateSmsNotificationAsync();

            var client = _factory.CreateClient().AuthenticatedAsSuperAdmin();
            var response = await client.GetAsync("/v3/notifications?type=email");
            var token = await response.CheckOk().AsTokenAsync();
            token.CheckPaging((t, n) => t.CheckNotification(n), n1.Entity);

            response = await client.GetAsync("/v3/notifications?type=sms");
            token = await response.CheckOk().AsTokenAsync();
            token.CheckPaging((t, n) => t.CheckNotification(n), n2.Entity);
        }

        [Fact]
        public async Task List_Should_Use_RecipientUserId_Query_Params()
        {
            using var scope = _factory.Services.NewTestScope();
            using var u1 = await scope.CreateUserAsync();
            using var u2 = await scope.CreateUserAsync();
            using var n1 = await scope.CreateEmailNotificationAsync(recipientUsers: new[] { u1.Entity });
            using var n2 = await scope.CreateEmailNotificationAsync(recipientUsers: new[] { u2.Entity });
            using var n3 = await scope.CreateEmailNotificationAsync();

            var client = _factory.CreateClient().AuthenticatedAsSuperAdmin();
            var response = await client.GetAsync($"/v3/notifications?recipientUserId={u1.Entity.Id}");
            var token = await response.CheckOk().AsTokenAsync();
            token.CheckPaging((t, n) => t.CheckNotification(n), n1.Entity);

            response = await client.GetAsync($"/v3/notifications?recipientUserId={u2.Entity.Id}");
            token = await response.CheckOk().AsTokenAsync();
            token.CheckPaging((t, n) => t.CheckNotification(n), n2.Entity);
        }

        [Fact]
        public async Task List_Should_Use_Paging_Query_Params()
        {
            using var scope = _factory.Services.NewTestScope();
            using var n1 = await scope.CreateEmailNotificationAsync();
            using var n2 = await scope.CreateEmailNotificationAsync();
            using var n3 = await scope.CreateEmailNotificationAsync();

            var client = _factory.CreateClient().AuthenticatedAsSuperAdmin();
            var response = await client.GetAsync("/v3/notifications?page=1&count=2");
            var token = await response.CheckOk().AsTokenAsync();
            token.CheckPaging(1, 3, (t, n) => t.CheckNotification(n),
                n3.Entity, n2.Entity);

            response = await client.GetAsync("/v3/notifications?page=2&count=2");
            token = await response.CheckOk().AsTokenAsync();
            token.CheckPaging(2, 3, (t, n) => t.CheckNotification(n), n1.Entity);
        }

        [Fact]
        public async Task List_Should_Use_Sorting_Query_Params()
        {
            using var scope = _factory.Services.NewTestScope();
            using var n1 = await scope.CreateEmailNotificationAsync();
            using var n2 = await scope.CreateEmailNotificationAsync();
            using var n3 = await scope.CreateEmailNotificationAsync();

            n3.Entity.Status = NotificationStatus.Cancelled;
            await scope.Db.UpdateAsync(n3.Entity);

            n2.Entity.Status = NotificationStatus.Failed;
            await scope.Db.UpdateAsync(n2.Entity);

            n1.Entity.Status = NotificationStatus.Sent;
            await scope.Db.UpdateAsync(n1.Entity);

            var client = _factory.CreateClient().AuthenticatedAsSuperAdmin();
            var response = await client.GetAsync("/v3/notifications?order=created");
            var token = await response.CheckOk().AsTokenAsync();
            token.CheckPaging((t, n) => t.CheckNotification(n),
                n3.Entity, n2.Entity, n1.Entity);

            response = await client.GetAsync("/v3/notifications?order=created&desc=true");
            token = await response.CheckOk().AsTokenAsync();
            token.CheckPaging((t, n) => t.CheckNotification(n),
                n3.Entity, n2.Entity, n1.Entity);

            response = await client.GetAsync("/v3/notifications?order=created&desc=false");
            token = await response.CheckOk().AsTokenAsync();
            token.CheckPaging((t, n) => t.CheckNotification(n),
                n1.Entity, n2.Entity, n3.Entity);

            response = await client.GetAsync("/v3/notifications?order=statusUpdated");
            token = await response.CheckOk().AsTokenAsync();
            token.CheckPaging((t, n) => t.CheckNotification(n),
                n1.Entity, n2.Entity, n3.Entity);

            response = await client.GetAsync("/v3/notifications?order=statusUpdated&desc=true");
            token = await response.CheckOk().AsTokenAsync();
            token.CheckPaging((t, n) => t.CheckNotification(n),
                n1.Entity, n2.Entity, n3.Entity);

            response = await client.GetAsync("/v3/notifications?order=statusUpdated&desc=false");
            token = await response.CheckOk().AsTokenAsync();
            token.CheckPaging((t, n) => t.CheckNotification(n),
                n3.Entity, n2.Entity, n1.Entity);
        }

        [Fact]
        public async Task List_Should_Use_IncludeStatistics_Query_Params()
        {
            using var scope = _factory.Services.NewTestScope();
            using var notification = await scope
                .CreateEmailNotificationAsync(totalSent: 1, totalErrors: 0);

            var client = _factory.CreateClient().AuthenticatedAsSuperAdmin();
            var response = await client.GetAsync("/v3/notifications?includeStatistics=true");
            var token = await response.CheckOk().AsTokenAsync();
            token.CheckPaging((t, n) => t.CheckNotification(n, 1, 0),
                notification.Entity);
        }
    }
}
