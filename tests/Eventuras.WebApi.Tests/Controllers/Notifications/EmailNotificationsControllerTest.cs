using Eventuras.Domain;
using Eventuras.Services;
using Eventuras.TestAbstractions;
using Losol.Communication.Email;
using Moq;
using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Notifications
{
    public class EmailNotificationsControllerTest : IClassFixture<CustomWebApiApplicationFactory<Startup>>, IDisposable
    {
        private readonly CustomWebApiApplicationFactory<Startup> _factory;

        public EmailNotificationsControllerTest(CustomWebApiApplicationFactory<Startup> factory)
        {
            _factory = factory;
            _factory.EmailSenderMock.Reset();
        }

        public void Dispose()
        {
            _factory.EmailSenderMock.Reset();
        }

        [Fact]
        public async Task Should_Require_Auth_To_Send_Notification()
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
        public async Task Should_Require_Admin_Role_To_Send_Notification()
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
        public async Task Should_Return_BadRequest_For_Invalid_Body(object body)
        {
            var client = _factory.CreateClient().AuthenticatedAsSuperAdmin();
            var response = await client.PostAsync("/v3/notifications/email", body);
            response.CheckBadRequest();
        }

        [Fact]
        public async Task Should_Not_Send_Any_Notification_If_No_Registrants_Found()
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
            response.CheckOk();

            _factory.EmailSenderMock.Verify(s => s
                .SendEmailAsync(It.IsAny<EmailModel>()), Times.Never);
        }

        /// <summary>
        /// 100 is a page size, need to ensure it sends out messages to more than 1 page of users.
        /// </summary>
        [Fact]
        public async Task Should_Send_Notifications_To_More_Than_100_Users()
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
                    response.CheckOk();

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
        public async Task Should_Send_Notifications_To_All_Users_For_Power_Admin(string role)
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
            response.CheckOk();

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
            response.CheckOk();

            CheckEmailSentTo("Test 2", "Test email 2",
                u2.Entity); // only user 2 is registered to event 2

            CheckEmailNotSentTo(u1.Entity);
        }

        [Theory]
        [InlineData(Roles.Admin)]
        [InlineData(Roles.SuperAdmin)]
        [InlineData(Roles.SystemAdmin)]
        public async Task Should_Send_Notifications_To_The_Given_Recipients_For_Admin(string role)
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
            response.CheckOk();

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
        public async Task Should_Use_Status_And_Type_Filter(string role)
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
            response.CheckOk();

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
            response.CheckOk();

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
            response.CheckOk();

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
            response.CheckOk();

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
            response.CheckOk();

            CheckEmailSentTo("Letter to everyone", "Letter to everyone body",
                u1.Entity, u2.Entity, u3.Entity);
        }

        private void CheckEmailSentTo(string subject, string body, params ApplicationUser[] users)
        {
            foreach (var u in users) // should send to both users
            {
                _factory.EmailSenderMock.Verify(s => s
                        .SendEmailAsync(It.Is(MatchUser(u, subject, body))),
                    Times.Once, $"Should send message {subject} to {u.Name}");
            }
        }

        private void CheckEmailNotSentTo(params ApplicationUser[] users)
        {
            foreach (var u in users) // should send to both users
            {
                _factory.EmailSenderMock.Verify(s => s
                        .SendEmailAsync(It.Is(MatchUser(u))),
                    Times.Never, $"Should send any message to {u.Name}");
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

        private static Expression<Func<EmailModel, bool>> MatchUser(string name, string email, string subject, string body)
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
                new object[] {new {bodyMarkdown = "Test", recipients = new[] {"test@email.com"}}},
                new object[] {new {subject = "Test", bodyMarkdown = "", recipients = new[] {"test@email.com"}}},
                new object[] {new {subject = "Test", bodyMarkdown = "Test", recipients = new[] {""}}},
                new object[] {new {subject = "Test", bodyMarkdown = "Test", recipients = new[] {"test"}}},
                new object[] {new {subject = "Test", bodyMarkdown = "Test"}},
                new object[] {new {subject = "Test", bodyMarkdown = "Test", eventParticipants = new { }}},
                new object[] {new {subject = "Test", bodyMarkdown = "Test", eventParticipants = new { eventId = 0 }}},
                new object[] {new {subject = "Test", bodyMarkdown = "Test", eventParticipants = new { eventId = -1 }}},
            };
        }
    }
}
