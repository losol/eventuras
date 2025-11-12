using System;
using System.Linq;
using System.Linq.Expressions;
using System.Net.Mail;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.TestAbstractions;
using Losol.Communication.Email;
using Moq;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Notifications;

public class EmailNotificationsControllerTest : IClassFixture<CustomWebApiApplicationFactory<Program>>,
    IDisposable
{
    private readonly CustomWebApiApplicationFactory<Program> _factory;

    public EmailNotificationsControllerTest(CustomWebApiApplicationFactory<Program> factory)
    {
        _factory = factory;
        Cleanup();
    }

    public void Dispose() => Cleanup();

    private void Cleanup()
    {
        _factory.EmailSenderMock.Reset();
        using var scope = _factory.Services.NewTestScope();
        scope.Db.Notifications.Clean();
        scope.Db.SaveChanges();
    }

    [Fact]
    public async Task Should_Require_Auth_To_Send_Email_Notification()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsync("/v3/notifications/email",
            new { subject = "Test", bodyMarkdown = "Test email", recipients = new[] { "test@email.com" } });
        response.CheckUnauthorized();
    }

    [Fact]
    public async Task Should_Require_Admin_Role_To_Send_Email_Notification()
    {
        var client = _factory.CreateClient().Authenticated();
        var response = await client.PostAsync("/v3/notifications/email",
            new { subject = "Test", bodyMarkdown = "Test email", recipients = new[] { "test@email.com" } });
        response.CheckForbidden();
    }

    [Theory]
    [MemberData(nameof(GetInvalidBodyParams))]
    public async Task Should_Return_BadRequest_For_Invalid_Email_Body(object body)
    {
        var client = _factory.CreateClient().AuthenticatedAsSuperAdmin();
        var response = await client.PostAsync("/v3/notifications/email", body);
        response.CheckBadRequest();
    }


    private void CheckEmailSentTo(string subject, string body, params ApplicationUser[] users)
    {
        foreach (var u in users) // should send to both users
        {
            _factory.EmailSenderMock.Verify(s => s
                    .SendEmailAsync(It.Is(MatchUser(u, subject, body)), It.IsAny<EmailOptions>()),
                Times.Once, $"Should've sent message {subject} to {u.Name}");
        }
    }

    private void CheckEmailSentTo(string subject, string body, params string[] recipients)
    {
        foreach (var r in recipients) // should send to both users
        {
            Assert.True(MailAddress.TryCreate(r, out var address));
            _factory.EmailSenderMock.Verify(s => s
                    .SendEmailAsync(It.Is(MatchUser(address.DisplayName, address.Address, subject, body)),
                        It.IsAny<EmailOptions>()),
                Times.Once, $"Should've sent message {subject} to {address}");
        }
    }

    private void CheckEmailNotSentTo(params ApplicationUser[] users)
    {
        foreach (var u in users) // should send to both users
        {
            _factory.EmailSenderMock.Verify(s => s
                    .SendEmailAsync(It.Is(MatchUser(u)), It.IsAny<EmailOptions>()),
                Times.Never, $"Shouldn't have sent any message to {u.Name}");
        }
    }

    private static Expression<Func<EmailModel, bool>> MatchUser(ApplicationUser user) => model =>
        model.Recipients.Any(r => r.Name == user.Name && r.Email == user.Email);

    private static Expression<Func<EmailModel, bool>> MatchUser(ApplicationUser user, string subject, string body) =>
        MatchUser(user.Name, user.Email, subject, body);

    private static Expression<Func<EmailModel, bool>> MatchUser(string name, string email, string subject,
        string body) =>
        model => model.Subject == subject &&
                 model.HtmlBody.Contains(body) &&
                 model.Recipients.Any(r =>
                     r.Name == name &&
                     r.Email == email);

    public static object[][] GetInvalidBodyParams() =>
        new[]
        {
            new object[] { new { bodyMarkdown = "Test", recipients = new[] { "test@email.com" } } },
            new object[] { new { subject = "Test", bodyMarkdown = "", recipients = new[] { "test@email.com" } } },
            new object[] { new { subject = "Test", bodyMarkdown = "Test", recipients = new[] { "" } } },
            new object[] { new { subject = "Test", bodyMarkdown = "Test", recipients = new[] { "test" } } },
            new object[] { new { subject = "Test", bodyMarkdown = "Test" } },
            new object[] { new { subject = "Test", bodyMarkdown = "Test", eventParticipants = new { } } },
            new object[]
            {
                new { subject = "Test", bodyMarkdown = "Test", eventParticipants = new { eventId = 0 } }
            },
            new object[]
            {
                new { subject = "Test", bodyMarkdown = "Test", eventParticipants = new { eventId = -1 } }
            }
        };
}
