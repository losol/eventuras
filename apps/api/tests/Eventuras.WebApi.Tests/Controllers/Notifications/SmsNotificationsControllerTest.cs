using System;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services;
using Eventuras.TestAbstractions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Notifications
{
    public class SmsNotificationsControllerTest : IClassFixture<CustomWebApiApplicationFactory<Program>>,
        IDisposable
    {
        private readonly CustomWebApiApplicationFactory<Program> _factory;

        public SmsNotificationsControllerTest(CustomWebApiApplicationFactory<Program> factory)
        {
            _factory = factory;
            Cleanup();
        }

        public void Dispose()
        {
            Cleanup();
        }

        private void Cleanup()
        {
            _factory.SmsSenderMock.Reset();
            using var scope = _factory.Services.NewTestScope();
            scope.Db.Notifications.Clean();
            scope.Db.SaveChanges();
        }

        [Fact]
        public async Task Should_Require_Auth_To_Send_Sms_Notification()
        {
            var client = _factory.CreateClient();
            var response = await client.PostAsync("/v3/notifications/sms", new
            {
                message = "Test message",
                recipients = new[] { "+11111111111" }
            });
            response.CheckUnauthorized();
        }

        [Fact]
        public async Task Should_Require_Admin_Role_To_Send_Sms_Notification()
        {
            var client = _factory.CreateClient().Authenticated();
            var response = await client.PostAsync("/v3/notifications/sms", new
            {
                message = "Test message",
                recipients = new[] { "+11111111111" }
            });
            response.CheckForbidden();
        }

        [Theory]
        [MemberData(nameof(GetInvalidBodyParams))]
        public async Task Should_Return_BadRequest_For_Invalid_Sms_Body(object body)
        {
            var client = _factory.CreateClient().AuthenticatedAsSuperAdmin();
            var response = await client.PostAsync("/v3/notifications/sms", body);
            response.CheckBadRequest();
        }



        private void CheckSmsSentTo(string message, params ApplicationUser[] users)
        {
            foreach (var u in users) // should send to both users
            {
                _factory.SmsSenderMock.Verify(s => s
                        .SendSmsAsync(u.PhoneNumber, message),
                    Times.Once, $"Should've sent message {message} to {u.PhoneNumber}");
            }
        }

        private void CheckSmsSentTo(string message, params string[] recipients)
        {
            foreach (var r in recipients) // should send to both users
            {
                _factory.SmsSenderMock.Verify(s => s
                        .SendSmsAsync(r, message),
                    Times.Once, $"Should've sent message {message} to {r}");
            }
        }

        private void CheckEmailNotSentTo(params ApplicationUser[] users)
        {
            foreach (var u in users) // should send to both users
            {
                _factory.SmsSenderMock.Verify(s => s
                        .SendSmsAsync(u.PhoneNumber, It.IsAny<string>()),
                    Times.Never, $"Shouldn't have sent any message to {u.PhoneNumber}");
            }
        }

        public static object[][] GetInvalidBodyParams()
        {
            return new[]
            {
                new object[] { new { message = "", recipients = new[] { "+11111111111" } } },
                new object[] { new { message = "Test", recipients = new[] { "" } } },
                new object[] { new { message = "Test", recipients = new[] { "test" } } },
                new object[] { new { message = "Test" } },
                new object[] { new { message = "Test", eventParticipants = new { } } },
                new object[] { new { message = "Test", eventParticipants = new { eventId = 0 } } },
                new object[] { new { message = "Test", eventParticipants = new { eventId = -1 } } },
            };
        }
    }
}
