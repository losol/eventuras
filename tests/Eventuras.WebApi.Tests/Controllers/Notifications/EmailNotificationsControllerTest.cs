using System;
using System.Linq;
using System.Linq.Expressions;
using System.Net.Http;
using System.Net.Mail;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services;
using Eventuras.TestAbstractions;
using Losol.Communication.Email;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Notifications
{
    public class EmailNotificationsControllerTest : IClassFixture<CustomWebApiApplicationFactory<Startup>>,
        IDisposable
    {
        private readonly CustomWebApiApplicationFactory<Startup> _factory;

        public EmailNotificationsControllerTest(CustomWebApiApplicationFactory<Startup> factory)
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
            _factory.EmailSenderMock.Reset();
            using var scope = _factory.Services.NewTestScope();
            scope.Db.Notifications.Clean();
            scope.Db.SaveChanges();
        }

        [Fact]
        public async Task Should_Require_Auth_To_Send_Email_Notification()
        {
            var client = _factory.CreateClient();
            var response = await client.PostAsync("/v3/notifications/email", new
            {
                subject = "Test",
                bodyMarkdown = "Test email",
                recipients = new[] { "test@email.com" }
            });
            response.CheckUnauthorized();
        }

        [Fact]
        public async Task Should_Require_Admin_Role_To_Send_Email_Notification()
        {
            var client = _factory.CreateClient().Authenticated();
            var response = await client.PostAsync("/v3/notifications/email", new
            {
                subject = "Test",
                bodyMarkdown = "Test email",
                recipients = new[] { "test@email.com" }
            });
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

        [Fact]
        public async Task Should_Not_Send_Any_Email_Notification_If_No_Registrants_Found()
        {
            using var scope = _factory.Services.NewTestScope();

            var client = _factory.CreateClient().AuthenticatedAsSuperAdmin();
            var response = await client.PostAsync("/v3/notifications/email", new
            {
                subject = "Test",
                bodyMarkdown = "Test email",
                eventParticipants = new
                {
                    eventId = 10001
                }
            });

            await response.CheckNotificationResponse(scope);

            _factory.EmailSenderMock.Verify(s => s
                .SendEmailAsync(It.IsAny<EmailModel>()), Times.Never);
        }

        [Fact]
        public async Task Should_Not_Send_Email_Notifications_To_Inaccessible_Events()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var otherUser = await scope.CreateUserAsync();
            using var admin = await scope.CreateUserAsync();
            using var otherAdmin = await scope.CreateUserAsync();
            using var org = await scope.CreateOrganizationAsync();
            using var otherOrg = await scope.CreateOrganizationAsync();

            using var m1 = await scope.CreateOrganizationMemberAsync(
                admin.Entity, org.Entity, role: Roles.Admin);
            using var m2 = await scope.CreateOrganizationMemberAsync(
                otherAdmin.Entity, otherOrg.Entity, role: Roles.Admin);

            using var e1 = await scope.CreateEventAsync(organization: org.Entity);
            using var e2 = await scope.CreateEventAsync(organization: otherOrg.Entity);
            using var r1 = await scope.CreateRegistrationAsync(e1.Entity, user.Entity);
            using var r2 = await scope.CreateRegistrationAsync(e1.Entity, otherUser.Entity);
            using var r3 = await scope.CreateRegistrationAsync(e2.Entity, otherUser.Entity);

            // Check 1. admin should not send to any user of the otherOrg

            var client = _factory.CreateClient()
                .AuthenticatedAs(admin.Entity, Roles.Admin);

            var response = await client.PostAsync($"/v3/notifications/email?orgId={org.Entity.OrganizationId}", new
            {
                subject = "Test 1",
                bodyMarkdown = "Test email 1",
                eventParticipants = new
                {
                    eventId = e2.Entity.EventInfoId // should not send to the registrants of this event
                }
            });
            response.CheckForbidden();

            _factory.EmailSenderMock.Verify(s => s
                .SendEmailAsync(It.IsAny<EmailModel>()), Times.Never);

            // Check 2. admin should send to all users of the org

            _factory.EmailSenderMock.Reset();

            response = await client.PostAsync($"/v3/notifications/email?orgId={org.Entity.OrganizationId}", new
            {
                subject = "Test 2",
                bodyMarkdown = "Test email 2",
                eventParticipants = new
                {
                    eventId = e1.Entity.EventInfoId
                }
            });

            await response.CheckNotificationResponse(scope,
                user.Entity, otherUser.Entity);

            CheckEmailSentTo("Test 2", "Test email 2",
                user.Entity, otherUser.Entity); // should send to both users

            // Check 3. otherAdmin should not send to any user since the current org is different.

            client.AuthenticatedAs(otherAdmin.Entity, Roles.Admin);

            _factory.EmailSenderMock.Reset();

            response = await client.PostAsync($"/v3/notifications/email?orgId={org.Entity.OrganizationId}", new
            {
                subject = "Test 3",
                bodyMarkdown = "Test email 3",
                eventParticipants = new
                {
                    eventId = e2.Entity.EventInfoId
                }
            });
            response.CheckForbidden();

            _factory.EmailSenderMock.Verify(s => s
                .SendEmailAsync(It.IsAny<EmailModel>()), Times.Never);
        }

        /// <summary>
        /// 100 is a page size, need to ensure it sends out messages to more than 1 page of users.
        /// </summary>
        [Fact]
        public async Task Should_Send_Email_Notifications_To_More_Than_100_Users()
        {
            using var scope = _factory.Services.NewTestScope();

            using var e = await scope.CreateEventAsync();

            var users = await Task.WhenAll(Enumerable
                .Range(0, 101)
                .Select(_ => scope.CreateUserAsync()));

            try
            {
                var registrations = await Task.WhenAll(users.Select(u => scope
                    .CreateRegistrationAsync(e.Entity, u.Entity)));

                try
                {
                    var client = _factory.CreateClient()
                        .AuthenticatedAsSuperAdmin();

                    var response = await client.PostAsync("/v3/notifications/email", new
                    {
                        subject = "Test",
                        bodyMarkdown = "Test email",
                        eventParticipants = new
                        {
                            eventId = e.Entity.EventInfoId
                        }
                    });

                    await response.CheckNotificationResponse(scope,
                        users.Select(u => u.Entity).ToArray());

                    _factory.EmailSenderMock.Verify(s => s
                        .SendEmailAsync(It.IsAny<EmailModel>()), Times.Exactly(users.Length));
                }
                finally
                {
                    foreach (var registration in registrations)
                    {
                        registration.Dispose();
                    }
                }
            }
            finally
            {
                foreach (var user in users)
                {
                    user.Dispose();
                }
            }
        }

        [Theory]
        [InlineData(Roles.SystemAdmin)]
        [InlineData(Roles.SuperAdmin)]
        public async Task Should_Send_Email_Notifications_To_All_Users_For_Power_Admin(string role)
        {
            using var scope = _factory.Services.NewTestScope();
            using var u1 = await scope.CreateUserAsync("User 1");
            using var u2 = await scope.CreateUserAsync("User 2");
            using var org1 = await scope.CreateOrganizationAsync();
            using var org2 = await scope.CreateOrganizationAsync();

            using var e1 = await scope.CreateEventAsync(organization: org1.Entity);
            using var e2 = await scope.CreateEventAsync(organization: org2.Entity);
            using var r1 = await scope.CreateRegistrationAsync(e1.Entity, u1.Entity);
            using var r2 = await scope.CreateRegistrationAsync(e1.Entity, u2.Entity);
            using var r3 = await scope.CreateRegistrationAsync(e2.Entity, u2.Entity);

            var client = _factory.CreateClient().Authenticated(role: role);

            var response = await client.PostAsync("/v3/notifications/email", new
            {
                subject = "Test 1",
                bodyMarkdown = "Test email 1",
                eventParticipants = new
                {
                    eventId = e1.Entity.EventInfoId
                }
            });

            await response.CheckNotificationResponse(scope, u1.Entity, u2.Entity);

            CheckEmailSentTo("Test 1", "Test email 1",
                u1.Entity, u2.Entity); // both users registered to event 1

            _factory.EmailSenderMock.Reset();

            response = await client.PostAsync("/v3/notifications/email", new
            {
                subject = "Test 2",
                bodyMarkdown = "Test email 2",
                eventParticipants = new
                {
                    eventId = e2.Entity.EventInfoId
                }
            });

            await response.CheckNotificationResponse(scope, u2.Entity);

            CheckEmailSentTo("Test 2", "Test email 2",
                u2.Entity); // only user 2 is registered to event 2

            CheckEmailNotSentTo(u1.Entity);
        }

        [Theory]
        [InlineData(Roles.Admin)]
        [InlineData(Roles.SuperAdmin)]
        [InlineData(Roles.SystemAdmin)]
        public async Task Should_Send_Email_Notifications_To_The_Given_Recipients_For_Admin(string role)
        {
            using var scope = _factory.Services.NewTestScope();

            var client = _factory.CreateClient().Authenticated(role: role);

            var response = await client.PostAsync("/v3/notifications/email", new
            {
                subject = "Test",
                bodyMarkdown = "Test email",
                recipients = new[]
                {
                    "Test Person <test@email.com>",
                    "Other Person <other@email.com>"
                }
            });

            await response.CheckNotificationResponse(scope, 2);

            _factory.EmailSenderMock.Verify(s => s
                    .SendEmailAsync(It.Is(MatchUser("Test Person", "test@email.com", "Test", "Test email"))),
                Times.Once);

            _factory.EmailSenderMock.Verify(s => s
                    .SendEmailAsync(It.Is(MatchUser("Other Person", "other@email.com", "Test", "Test email"))),
                Times.Once);
        }

        [Theory]
        [InlineData(Roles.SuperAdmin)]
        [InlineData(Roles.SystemAdmin)]
        public async Task Email_Notifications_Should_Use_Status_And_Type_Filter(string role)
        {
            var client = _factory.CreateClient().Authenticated(role: role);

            using var scope = _factory.Services.NewTestScope();
            using var u1 = await scope.CreateUserAsync();
            using var u2 = await scope.CreateUserAsync();
            using var u3 = await scope.CreateUserAsync();

            using var e = await scope.CreateEventAsync();

            using var r1 = await scope.CreateRegistrationAsync(e.Entity, u1.Entity,
                type: Registration.RegistrationType.Participant,
                status: Registration.RegistrationStatus.Verified);

            using var r2 = await scope.CreateRegistrationAsync(e.Entity, u2.Entity,
                type: Registration.RegistrationType.Student,
                status: Registration.RegistrationStatus.Draft);

            using var r3 = await scope.CreateRegistrationAsync(e.Entity, u3.Entity,
                type: Registration.RegistrationType.Lecturer,
                status: Registration.RegistrationStatus.Verified);

            // 1. send to all registrants having Verified status

            var response = await client.PostAsync("/v3/notifications/email", new
            {
                subject = "Letter to verified users",
                bodyMarkdown = "Letter to verified users body",
                eventParticipants = new
                {
                    eventId = e.Entity.EventInfoId,
                    registrationStatuses = new[] { "Verified" },
                    registrationTypes = new[] { "Participant", "Student", "Lecturer" }
                }
            });

            await response.CheckNotificationResponse(scope, u1.Entity, u3.Entity);

            CheckEmailSentTo("Letter to verified users", "Letter to verified users body", u1.Entity, u3.Entity);
            CheckEmailNotSentTo(u2.Entity);

            // 2. send to all registrants having Draft status

            _factory.EmailSenderMock.Reset();

            response = await client.PostAsync("/v3/notifications/email", new
            {
                subject = "Letter to draft users",
                bodyMarkdown = "Letter to draft users body",
                eventParticipants = new
                {
                    eventId = e.Entity.EventInfoId,
                    registrationStatuses = new[] { Registration.RegistrationStatus.Draft },
                    registrationTypes = new[] { "Participant", "Student", "Lecturer" }
                }
            });

            await response.CheckNotificationResponse(scope, u2.Entity);

            CheckEmailSentTo("Letter to draft users", "Letter to draft users body", u2.Entity);
            CheckEmailNotSentTo(u1.Entity, u3.Entity);

            // 3. send to all registrants having Participant type

            _factory.EmailSenderMock.Reset();

            response = await client.PostAsync("/v3/notifications/email", new
            {
                subject = "Letter to participants",
                bodyMarkdown = "Letter to participants body",
                eventParticipants = new
                {
                    eventId = e.Entity.EventInfoId,
                    registrationTypes = new[] { Registration.RegistrationType.Participant }
                }
            });

            await response.CheckNotificationResponse(scope, u1.Entity);

            CheckEmailSentTo("Letter to participants", "Letter to participants body", u1.Entity);
            CheckEmailNotSentTo(u2.Entity, u3.Entity);

            // 4. send to all registrants having combination of Lecturer type and Verified status

            _factory.EmailSenderMock.Reset();

            response = await client.PostAsync("/v3/notifications/email", new
            {
                subject = "Letter to verified lecturers",
                bodyMarkdown = "Letter to verified lecturers body",
                eventParticipants = new
                {
                    eventId = e.Entity.EventInfoId,
                    registrationStatuses = new[] { Registration.RegistrationStatus.Verified },
                    registrationTypes = new[] { Registration.RegistrationType.Lecturer }
                }
            });

            await response.CheckNotificationResponse(scope, u3.Entity);

            CheckEmailSentTo("Letter to verified lecturers", "Letter to verified lecturers body", u3.Entity);
            CheckEmailNotSentTo(u1.Entity, u2.Entity);

            // 4. send to multiple registrant statuses and types

            _factory.EmailSenderMock.Reset();

            response = await client.PostAsync("/v3/notifications/email", new
            {
                subject = "Letter to everyone",
                bodyMarkdown = "Letter to everyone body",
                eventParticipants = new
                {
                    eventId = e.Entity.EventInfoId,
                    registrationStatuses = new[]
                    {
                        Registration.RegistrationStatus.Verified,
                        Registration.RegistrationStatus.Draft
                    },
                    registrationTypes = new[]
                    {
                        Registration.RegistrationType.Participant,
                        Registration.RegistrationType.Student,
                        Registration.RegistrationType.Lecturer
                    }
                }
            });
            
            await response.CheckNotificationResponse(scope,
                u1.Entity, u2.Entity, u3.Entity);

            CheckEmailSentTo("Letter to everyone", "Letter to everyone body",
                u1.Entity, u2.Entity, u3.Entity);
        }

        [Fact]
        public async Task Should_Create_Email_Notifications_In_Db_With_No_Event_Binding()
        {
            using var scope = _factory.Services.NewTestScope();
            using var admin = await scope.CreateUserAsync(role: Roles.SuperAdmin);

            var client = _factory.CreateClient()
                .AuthenticatedAs(admin.Entity, Roles.SuperAdmin);

            const string subject = "Test 1";
            const string body = "Test email 1";
            const string address = "Test <test@email.com>";

            var response = await client.PostAsync("/v3/notifications/email", new
            {
                subject = subject,
                bodyMarkdown = body,
                recipients = new[] { address }
            });
            
            await response.CheckNotificationResponse(scope, 1);

            CheckEmailSentTo(subject, body, address);

            var notification = await scope.Db.Notifications
                .Include(n => n.Recipients)
                .Include(n => n.Statistics)
                .SingleAsync();

            Assert.IsType<EmailNotification>(notification);
            Assert.Equal(NotificationType.Email, notification.Type);
            Assert.Equal(notification.CreatedByUserId, admin.Entity.Id);
            Assert.Null(notification.OrganizationId);
            Assert.Null(notification.EventInfoId);
            Assert.Null(notification.ProductId);
            Assert.Equal(NotificationStatus.Sent, notification.Status);

            var recipient = Assert.Single(notification.Recipients);
            Assert.Equal("Test", recipient.RecipientName);
            Assert.Equal("test@email.com", recipient.RecipientIdentifier);
            Assert.Null(recipient.Errors);
            Assert.NotNull(recipient.Sent);
            Assert.True(recipient.IsSent);
            Assert.Null(recipient.RecipientUserId);
            Assert.False(recipient.HasErrors);

            var statistics = notification.Statistics;
            Assert.NotNull(statistics);
            Assert.Equal(1, statistics.SentTotal);
            Assert.Equal(0, statistics.ErrorsTotal);
        }

        [Fact]
        public async Task Should_Bind_Email_Notifications_To_Event_And_Current_Org()
        {
            using var scope = _factory.Services.NewTestScope();
            using var org = await scope.CreateOrganizationAsync();
            using var user = await scope.CreateUserAsync();
            using var evt = await scope.CreateEventAsync();
            using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);

            using var admin = await scope
                .CreateUserAsync(role: Roles.SuperAdmin);

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.SuperAdmin);

            var response = await client.PostAsync($"/v3/notifications/email?orgId={org.Entity.OrganizationId}", new
            {
                subject = "Test 1",
                bodyMarkdown = "Test email 1",
                eventParticipants = new
                {
                    eventId = evt.Entity.EventInfoId
                }
            });
            
            await response.CheckNotificationResponse(scope, user.Entity);

            CheckEmailSentTo("Test 1", "Test email 1", user.Entity);

            var notification = await scope.Db.Notifications
                .Include(n => n.Recipients)
                .Include(n => n.Statistics)
                .SingleAsync();

            Assert.IsType<EmailNotification>(notification);
            Assert.Equal(NotificationType.Email, notification.Type);
            Assert.Equal(notification.CreatedByUserId, admin.Entity.Id);
            Assert.Equal(org.Entity.OrganizationId, notification.OrganizationId);
            Assert.Equal(evt.Entity.EventInfoId, notification.EventInfoId);
            Assert.Null(notification.ProductId);
            Assert.Equal(NotificationStatus.Sent, notification.Status);

            var recipient = Assert.Single(notification.Recipients);
            Assert.Equal(user.Entity.Name, recipient.RecipientName);
            Assert.Equal(user.Entity.Email, recipient.RecipientIdentifier);
            Assert.Null(recipient.Errors);
            Assert.NotNull(recipient.Sent);
            Assert.True(recipient.IsSent);
            Assert.Equal(user.Entity.Id, recipient.RecipientUserId);
            Assert.False(recipient.HasErrors);

            var statistics = notification.Statistics;
            Assert.NotNull(statistics);
            Assert.Equal(1, statistics.SentTotal);
            Assert.Equal(0, statistics.ErrorsTotal);
        }

        [Fact]
        public async Task Should_Bind_Email_Notifications_To_The_Given_Product_And_Filter_Recipient_List()
        {
            using var scope = _factory.Services.NewTestScope();
            using var org = await scope.CreateOrganizationAsync();
            using var evt = await scope.CreateEventAsync();
            using var p = await scope.CreateProductAsync(evt.Entity);
            using var u1 = await scope.CreateUserAsync();
            using var u2 = await scope.CreateUserAsync();
            using var r1 = await scope.CreateRegistrationAsync(evt.Entity, u1.Entity);
            using var r2 = await scope.CreateRegistrationAsync(evt.Entity, u2.Entity);
            using var o = await scope.CreateOrderAsync(r2.Entity, p.Entity);

            using var admin = await scope
                .CreateUserAsync(role: Roles.SuperAdmin);

            var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.SuperAdmin);

            var response = await client.PostAsync("/v3/notifications/email", new
            {
                subject = "Test 1",
                bodyMarkdown = "Test email 1",
                eventParticipants = new
                {
                    productId = p.Entity.ProductId
                }
            });

            await response.CheckNotificationResponse(scope, u2.Entity);

            CheckEmailNotSentTo(u1.Entity);
            CheckEmailSentTo("Test 1", "Test email 1", u2.Entity); // only user u2 has ordered product p 

            var notification = await scope.Db.Notifications
                .Include(n => n.Recipients)
                .Include(n => n.Statistics)
                .SingleAsync();

            Assert.IsType<EmailNotification>(notification);
            Assert.Equal(NotificationType.Email, notification.Type);
            Assert.Equal(notification.CreatedByUserId, admin.Entity.Id);
            Assert.Null(notification.OrganizationId);
            Assert.Equal(evt.Entity.EventInfoId, notification.EventInfoId);
            Assert.Equal(p.Entity.ProductId, notification.ProductId);
            Assert.Equal(NotificationStatus.Sent, notification.Status);

            var recipient = Assert.Single(notification.Recipients);
            Assert.Equal(u2.Entity.Id, recipient.RecipientUserId);
            Assert.Equal(u2.Entity.Name, recipient.RecipientName);
            Assert.Equal(u2.Entity.Email, recipient.RecipientIdentifier);
            Assert.Null(recipient.Errors);
            Assert.NotNull(recipient.Sent);
            Assert.True(recipient.IsSent);
            Assert.False(recipient.HasErrors);

            var statistics = notification.Statistics;
            Assert.NotNull(statistics);
            Assert.Equal(1, statistics.SentTotal);
            Assert.Equal(0, statistics.ErrorsTotal);
        }

        [Fact]
        public async Task Should_Set_Error_For_Email_Recipient_In_Case_Of_A_Delivery_Failure()
        {
            var emailSenderMock = _factory.EmailSenderMock;
            emailSenderMock.Reset();
            emailSenderMock.Setup(s => s.SendEmailAsync(It.IsAny<EmailModel>()))
                .ThrowsAsync(new Exception("test error"));

            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var evt = await scope.CreateEventAsync();
            using var reg = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);

            using var admin = await scope
                .CreateUserAsync(role: Roles.SuperAdmin);

            var client = _factory.CreateClient()
                .AuthenticatedAs(admin.Entity, Roles.SuperAdmin);

            var response = await client.PostAsync("/v3/notifications/email", new
            {
                subject = "Test 1",
                bodyMarkdown = "Test email 1",
                eventParticipants = new
                {
                    eventId = evt.Entity.EventInfoId
                }
            });
            
            await response.CheckNotificationResponse(scope, 1, 0, 1);

            var notification = await scope.Db.Notifications
                .Include(n => n.Recipients)
                .Include(n => n.Statistics)
                .SingleAsync();

            Assert.IsType<EmailNotification>(notification);
            Assert.Equal(NotificationType.Email, notification.Type);
            Assert.Equal(notification.CreatedByUserId, admin.Entity.Id);
            Assert.Equal(evt.Entity.EventInfoId, notification.EventInfoId);
            Assert.Null(notification.OrganizationId);
            Assert.Null(notification.ProductId);
            Assert.Equal(NotificationStatus.Failed, notification.Status);

            var recipient = Assert.Single(notification.Recipients);
            Assert.Equal(user.Entity.Id, recipient.RecipientUserId);
            Assert.Equal(user.Entity.Name, recipient.RecipientName);
            Assert.Equal(user.Entity.Email, recipient.RecipientIdentifier);
            Assert.Equal("test error", recipient.Errors);
            Assert.Null(recipient.Sent);
            Assert.False(recipient.IsSent);
            Assert.True(recipient.HasErrors);

            var statistics = notification.Statistics;
            Assert.NotNull(statistics);
            Assert.Equal(0, statistics.SentTotal);
            Assert.Equal(1, statistics.ErrorsTotal);
        }

        private void CheckEmailSentTo(string subject, string body, params ApplicationUser[] users)
        {
            foreach (var u in users) // should send to both users
            {
                _factory.EmailSenderMock.Verify(s => s
                        .SendEmailAsync(It.Is(MatchUser(u, subject, body))),
                    Times.Once, $"Should've sent message {subject} to {u.Name}");
            }
        }

        private void CheckEmailSentTo(string subject, string body, params string[] recipients)
        {
            foreach (var r in recipients) // should send to both users
            {
                Assert.True(MailAddress.TryCreate(r, out var address));
                _factory.EmailSenderMock.Verify(s => s
                        .SendEmailAsync(It.Is(MatchUser(address.DisplayName, address.Address, subject, body))),
                    Times.Once, $"Should've sent message {subject} to {address}");
            }
        }

        private void CheckEmailNotSentTo(params ApplicationUser[] users)
        {
            foreach (var u in users) // should send to both users
            {
                _factory.EmailSenderMock.Verify(s => s
                        .SendEmailAsync(It.Is(MatchUser(u))),
                    Times.Never, $"Shouldn't have sent any message to {u.Name}");
            }
        }

        private static Expression<Func<EmailModel, bool>> MatchUser(ApplicationUser user)
        {
            return model => model.Recipients.Any(r => r.Name == user.Name && r.Email == user.Email);
        }

        private static Expression<Func<EmailModel, bool>> MatchUser(ApplicationUser user, string subject, string body)
        {
            return MatchUser(user.Name, user.Email, subject, body);
        }

        private static Expression<Func<EmailModel, bool>> MatchUser(string name, string email, string subject,
            string body)
        {
            return model => model.Subject == subject &&
                            model.HtmlBody.Contains(body) &&
                            model.Recipients.Any(r =>
                                r.Name == name &&
                                r.Email == email);
        }

        public static object[][] GetInvalidBodyParams()
        {
            return new[]
            {
                new object[] { new { bodyMarkdown = "Test", recipients = new[] { "test@email.com" } } },
                new object[] { new { subject = "Test", bodyMarkdown = "", recipients = new[] { "test@email.com" } } },
                new object[] { new { subject = "Test", bodyMarkdown = "Test", recipients = new[] { "" } } },
                new object[] { new { subject = "Test", bodyMarkdown = "Test", recipients = new[] { "test" } } },
                new object[] { new { subject = "Test", bodyMarkdown = "Test" } },
                new object[] { new { subject = "Test", bodyMarkdown = "Test", eventParticipants = new { } } },
                new object[]
                    { new { subject = "Test", bodyMarkdown = "Test", eventParticipants = new { eventId = 0 } } },
                new object[]
                    { new { subject = "Test", bodyMarkdown = "Test", eventParticipants = new { eventId = -1 } } },
            };
        }
    }
}
