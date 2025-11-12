using System;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services;
using Eventuras.TestAbstractions;
using NodaTime;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Notifications;

public class NotificationRecipientsControllerTest : IClassFixture<CustomWebApiApplicationFactory<Program>>
{
    private readonly CustomWebApiApplicationFactory<Program> _factory;

    public NotificationRecipientsControllerTest(CustomWebApiApplicationFactory<Program> factory) =>
        _factory = factory ?? throw new ArgumentNullException(nameof(factory));

    [Fact]
    public async Task Should_Require_Auth_For_Getting_Recipients()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/v3/notifications/1/recipients");
        response.CheckUnauthorized();
    }

    [Fact]
    public async Task Should_Return_Not_Found_For_Unknown_Notification()
    {
        var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
        var response = await client.GetAsync("/v3/notifications/1/recipients");
        response.CheckNotFound();
    }

    [Theory]
    [MemberData(nameof(GetInvalidListQueryParams))]
    public async Task List_Should_Check_Query_Params(object queryParams)
    {
        using var scope = _factory.Services.NewTestScope();
        using var notification = await scope.CreateEmailNotificationAsync();

        var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
        var response = await client.GetAsync(
            $"/v3/notifications/{notification.Entity.NotificationId}/recipients",
            queryParams);

        response.CheckBadRequest();
    }

    public static object[][] GetInvalidListQueryParams() =>
        new[]
        {
            new object[] { new { page = "invalid" } }, new object[] { new { page = -1 } },
            new object[] { new { page = 0 } }, new object[] { new { count = "invalid" } },
            new object[] { new { count = -1 } }, new object[] { new { order = "invalid" } },
            new object[] { new { desc = "invalid" } }, new object[] { new { sentOnly = "invalid" } },
            new object[] { new { errorsOnly = "invalid" } }
        };

    [Fact]
    public async Task Should_Limit_Recipients_For_Regular_User()
    {
        using var scope = _factory.Services.NewTestScope();
        using var u1 = await scope.CreateUserAsync();
        using var u2 = await scope.CreateUserAsync();
        using var notification = await scope
            .CreateEmailNotificationAsync(recipientUsers: new[] { u1.Entity, u2.Entity });

        var client = _factory.CreateClient()
            .AuthenticatedAs(u1.Entity);

        var response = await client.GetAsync(
            $"/v3/notifications/{notification.Entity.NotificationId}/recipients");

        var json = await response.CheckOk().AsTokenAsync();
        json.CheckPaging((t, r) =>
                t.CheckNotificationRecipient(r),
            notification.Entity.Recipients.First());
    }

    [Fact]
    public async Task Should_Limit_Recipients_For_Org_Admin()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var admin = await scope.CreateUserAsync();
        using var member = await scope
            .CreateOrganizationMemberAsync(admin.Entity, org.Entity);
        using var notification = await scope
            .CreateEmailNotificationAsync();

        var client = _factory.CreateClient()
            .AuthenticatedAs(admin.Entity, Roles.Admin);

        var response = await client.GetAsync(
            $"/v3/notifications/{notification.Entity.NotificationId}/recipients",
            new { orgId = org.Entity.OrganizationId });

        response.CheckForbidden();
    }

    [Fact]
    public async Task Should_List_Recipients_For_Org_Admin()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var admin = await scope.CreateUserAsync();
        using var member = await scope
            .CreateOrganizationMemberAsync(admin.Entity, org.Entity);
        using var user = await scope.CreateUserAsync();
        using var notification = await scope
            .CreateEmailNotificationAsync(organization: org.Entity,
                recipientUsers: new[] { user.Entity });

        var client = _factory.CreateClient()
            .AuthenticatedAs(admin.Entity, Roles.Admin);

        var response = await client.GetAsync(
            $"/v3/notifications/{notification.Entity.NotificationId}/recipients",
            new { orgId = org.Entity.OrganizationId });

        var json = await response.CheckOk().AsTokenAsync();
        json.CheckPaging((t, r) =>
                t.CheckNotificationRecipient(r),
            notification.Entity.Recipients.First());
    }

    [Theory]
    [InlineData(Roles.SuperAdmin)]
    [InlineData(Roles.SystemAdmin)]
    public async Task Should_Not_Limit_Recipients_For_Power_Admin(string role)
    {
        using var scope = _factory.Services.NewTestScope();
        using var u1 = await scope.CreateUserAsync();
        using var u2 = await scope.CreateUserAsync();
        using var notification = await scope
            .CreateEmailNotificationAsync(recipientUsers: new[] { u1.Entity, u2.Entity });

        var client = _factory.CreateClient()
            .Authenticated(role: role);

        var response = await client.GetAsync(
            $"/v3/notifications/{notification.Entity.NotificationId}/recipients");

        var json = await response.CheckOk().AsTokenAsync();
        json.CheckPaging((t, r) =>
                t.CheckNotificationRecipient(r),
            notification.Entity.Recipients
                .Reverse().ToArray()); // last goes first (default order=created, desc)
    }

    [Fact]
    public async Task List_Should_Use_Paging_Query_Params()
    {
        using var scope = _factory.Services.NewTestScope();
        using var u1 = await scope.CreateUserAsync();
        using var u2 = await scope.CreateUserAsync();
        using var u3 = await scope.CreateUserAsync();
        using var notification = await scope
            .CreateEmailNotificationAsync(recipientUsers: new[] { u1.Entity, u2.Entity, u3.Entity });

        var recipients = notification.Entity.Recipients.ToArray();

        var client = _factory.CreateClient().AuthenticatedAsSuperAdmin();
        var response = await client.GetAsync(
            $"/v3/notifications/{notification.Entity.NotificationId}/recipients?page=1&count=2");

        var json = await response.CheckOk().AsTokenAsync();
        json.CheckPaging(1, 3, (t, r) =>
                t.CheckNotificationRecipient(r),
            recipients[2], recipients[1]);

        response = await client.GetAsync(
            $"/v3/notifications/{notification.Entity.NotificationId}/recipients?page=2&count=2");

        json = await response.CheckOk().AsTokenAsync();
        json.CheckPaging(2, 3, (t, r) =>
                t.CheckNotificationRecipient(r),
            recipients[0]);
    }

    [Fact]
    public async Task List_Should_Use_Order_Query_Params()
    {
        using var scope = _factory.Services.NewTestScope();
        using var u1 = await scope.CreateUserAsync();
        using var u2 = await scope.CreateUserAsync();
        using var u3 = await scope.CreateUserAsync();
        using var notification = await scope
            .CreateEmailNotificationAsync(recipientUsers: new[] { u1.Entity, u2.Entity, u3.Entity });

        var recipients = notification.Entity.Recipients.ToArray();

        recipients[2].Sent = SystemClock.Instance.Now().Minus(Duration.FromSeconds(3));
        recipients[1].Sent = SystemClock.Instance.Now().Minus(Duration.FromSeconds(2));
        recipients[0].Sent = SystemClock.Instance.Now().Minus(Duration.FromSeconds(1));
        await scope.Db.SaveChangesAsync();

        var client = _factory.CreateClient()
            .AuthenticatedAsSuperAdmin();

        var response = await client.GetAsync(
            $"/v3/notifications/{notification.Entity.NotificationId}/recipients");

        var json = await response.CheckOk().AsTokenAsync();
        json.CheckPaging((t, r) =>
                t.CheckNotificationRecipient(r),
            recipients.Reverse().ToArray()); // default sort by create date, desc

        response = await client.GetAsync(
            $"/v3/notifications/{notification.Entity.NotificationId}/recipients?order=created");

        json = await response.CheckOk().AsTokenAsync();
        json.CheckPaging((t, r) => t.CheckNotificationRecipient(r),
            recipients.Reverse().ToArray()); // still the same

        response = await client.GetAsync(
            $"/v3/notifications/{notification.Entity.NotificationId}/recipients?order=created&desc=true");

        json = await response.CheckOk().AsTokenAsync();
        json.CheckPaging((t, r) => t.CheckNotificationRecipient(r),
            recipients.Reverse().ToArray()); // still the same

        response = await client.GetAsync(
            $"/v3/notifications/{notification.Entity.NotificationId}/recipients?order=created&desc=false");

        json = await response.CheckOk().AsTokenAsync();
        json.CheckPaging((t, r) => t.CheckNotificationRecipient(r),
            recipients.ToArray());

        response = await client.GetAsync(
            $"/v3/notifications/{notification.Entity.NotificationId}/recipients?order=sent");

        json = await response.CheckOk().AsTokenAsync();
        json.CheckPaging((t, r) => t.CheckNotificationRecipient(r),
            recipients.ToArray());

        response = await client.GetAsync(
            $"/v3/notifications/{notification.Entity.NotificationId}/recipients?order=sent&desc=true");

        json = await response.CheckOk().AsTokenAsync();
        json.CheckPaging((t, r) => t.CheckNotificationRecipient(r),
            recipients.ToArray());

        response = await client.GetAsync(
            $"/v3/notifications/{notification.Entity.NotificationId}/recipients?order=sent&desc=false");

        json = await response.CheckOk().AsTokenAsync();
        json.CheckPaging((t, r) => t.CheckNotificationRecipient(r),
            recipients.Reverse().ToArray());
    }

    [Fact]
    public async Task List_Should_Use_Query_Param()
    {
        using var scope = _factory.Services.NewTestScope();
        using var u1 = await scope.CreateUserAsync("First User", "user1st@email.com");
        using var u2 = await scope.CreateUserAsync("Second User", "user2nd@email.com");
        using var u3 = await scope.CreateUserAsync("Third User", "user3rd@email.com");
        using var notification = await scope
            .CreateEmailNotificationAsync(recipientUsers: new[] { u1.Entity, u2.Entity, u3.Entity });

        var recipients = notification.Entity.Recipients.ToArray();

        var client = _factory.CreateClient().AuthenticatedAsSuperAdmin();
        var response = await client.GetAsync(
            $"/v3/notifications/{notification.Entity.NotificationId}/recipients", new { query = "first" });

        var json = await response.CheckOk().AsTokenAsync();
        json.CheckPaging((t, r) => t.CheckNotificationRecipient(r), recipients[0]);

        response = await client.GetAsync(
            $"/v3/notifications/{notification.Entity.NotificationId}/recipients", new { query = "SECOND" });

        json = await response.CheckOk().AsTokenAsync();
        json.CheckPaging((t, r) => t.CheckNotificationRecipient(r), recipients[1]);

        response = await client.GetAsync(
            $"/v3/notifications/{notification.Entity.NotificationId}/recipients", new { query = "3rd" });

        json = await response.CheckOk().AsTokenAsync();
        json.CheckPaging((t, r) => t.CheckNotificationRecipient(r), recipients[2]);

        response = await client.GetAsync(
            $"/v3/notifications/{notification.Entity.NotificationId}/recipients", new { query = "email.com" });

        json = await response.CheckOk().AsTokenAsync();
        json.CheckPaging((t, r) => t.CheckNotificationRecipient(r),
            recipients.Reverse().ToArray());
    }

    [Fact]
    public async Task List_Should_Use_Sent_Param()
    {
        using var scope = _factory.Services.NewTestScope();
        using var u1 = await scope.CreateUserAsync();
        using var u2 = await scope.CreateUserAsync();
        using var notification = await scope
            .CreateEmailNotificationAsync(recipientUsers: new[] { u1.Entity, u2.Entity });

        var recipients = notification.Entity.Recipients.ToArray();
        recipients[1].Sent = SystemClock.Instance.Now();
        await scope.Db.SaveChangesAsync();

        var client = _factory.CreateClient()
            .AuthenticatedAsSuperAdmin();

        var response = await client.GetAsync(
            $"/v3/notifications/{notification.Entity.NotificationId}/recipients?sentOnly=true");

        var json = await response.CheckOk().AsTokenAsync();
        json.CheckPaging((t, r) =>
            t.CheckNotificationRecipient(r), recipients[1]);
    }

    [Fact]
    public async Task List_Should_Use_ErrorsOnly_Param()
    {
        using var scope = _factory.Services.NewTestScope();
        using var u1 = await scope.CreateUserAsync();
        using var u2 = await scope.CreateUserAsync();
        using var notification = await scope
            .CreateEmailNotificationAsync(recipientUsers: new[] { u1.Entity, u2.Entity });

        var recipients = notification.Entity.Recipients.ToArray();
        recipients[1].Errors = "some";
        await scope.Db.SaveChangesAsync();

        var client = _factory.CreateClient()
            .AuthenticatedAsSuperAdmin();

        var response = await client.GetAsync(
            $"/v3/notifications/{notification.Entity.NotificationId}/recipients?errorsOnly=true");

        var json = await response.CheckOk().AsTokenAsync();
        json.CheckPaging((t, r) =>
            t.CheckNotificationRecipient(r), recipients[1]);
    }
}
