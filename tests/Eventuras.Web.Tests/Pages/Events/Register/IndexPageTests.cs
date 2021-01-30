using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.IntegrationTests;
using Eventuras.TestAbstractions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace Eventuras.Web.Tests.Pages.Events.Register
{
    public class IndexPageTests : IClassFixture<CustomWebApplicationFactory<Startup>>, IDisposable
    {
        private const string Email = "some-test@email.com";

        private readonly CustomWebApplicationFactory<Startup> factory;

        public IndexPageTests(CustomWebApplicationFactory<Startup> factory)
        {
            this.factory = factory;
        }

        public void Dispose()
        {
            this.factory.EmailSenderMock.Reset();

            using var scope = this.factory.Services.NewTestScope();

            
            var user = scope.Db.Users.FirstOrDefault(u => u.Email == Email);
            if (user != null)
            {
                scope.Db.Remove(user);
                scope.Db.SaveChanges();
            }
        }

        [Theory]
        [InlineData("nb-NO", "Du var allerede påmeldt!", "Vi hadde allerede en registrering for deg.")]
        [InlineData("en-US", "You were already signed up!", "We already had a registration for you.")]
        public async Task Should_Send_Email_When_Already_Registered(string language, string subject, string body)
        {
            var client = this.factory.CreateClient();
            client.AcceptLanguage(language);

            using var scope = this.factory.Services.NewTestScope();

            
            using var eventInfo = await scope.CreateEventAsync();
            using var user = await scope.CreateUserAsync(email: Email);
            using var registration = await scope.CreateRegistrationAsync(eventInfo.Entity, user.Entity);

            var emailExpectation = this.factory.EmailSenderMock
                .ExpectEmail()
                .SentTo(Email)
                .WithSubject(subject)
                .ContainingText(body)
                .Setup();

            var token = await client.GetAntiForgeryTokenAsync("/Account/Login");
            var response = await client.PostAsync($"/events/{eventInfo.Entity.EventInfoId}/{eventInfo.Entity.Code}/register",
                new Dictionary<string, string>
            {
                { "Email", Email },
                { "PhoneCountryCode", "+1" },
                { "Phone", "1111111111" },
                { "ParticipantName", "John Doe" },
                { "ParticipantJobTitle", "Head" },
                { "ParticipantCity", "Oslo" },
                { "Notes", "Testing" }
            }, token);

            Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync());

            emailExpectation.VerifyEmailSent();
        }

        [Theory]
        [InlineData("nb-NO", "Velkommen på kurs!", "Vi fikk registreringen din")]
        [InlineData("en-US", "Welcome to the course!", "We received your registration")]
        public async Task Should_Create_New_Registration_For_Existing_User(string language, string subject, string body)
        {
            var client = this.factory.CreateClient();
            client.AcceptLanguage(language);

            using var scope = this.factory.Services.NewTestScope();

            
            using var eventInfo = await scope.CreateEventAsync();
            using var user = await scope.CreateUserAsync(email: Email);

            var emailExpectation = this.factory.EmailSenderMock
                .ExpectEmail()
                .SentTo(Email)
                .WithSubject(subject)
                .ContainingText(body)
                .Setup();

            var token = await client.GetAntiForgeryTokenAsync("/Account/Login");
            var response = await client.PostAsync($"/events/{eventInfo.Entity.EventInfoId}/{eventInfo.Entity.Code}/register",
                new Dictionary<string, string>
            {
                { "Email", Email },
                { "PhoneCountryCode", "+1" },
                { "Phone", "1111111111" },
                { "ParticipantName", "John Doe" },
                { "ParticipantJobTitle", "Head" },
                { "ParticipantCity", "Oslo" },
                { "Notes", "Testing" }
            }, token);

            Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync());

            var registration =
                await scope.Db.Registrations.FirstOrDefaultAsync(r =>
                    r.UserId == user.Entity.Id && r.EventInfoId == eventInfo.Entity.EventInfoId);

            Assert.NotNull(registration);
            Assert.Equal("John Doe", registration.ParticipantName);
            Assert.Equal("Head", registration.ParticipantJobTitle);
            Assert.Equal("Oslo", registration.ParticipantCity);
            Assert.Equal("Testing", registration.Notes);

            emailExpectation.VerifyEmailSent();
        }

        [Theory]
        [InlineData("nb-NO", "Velkommen på kurs!", "Vi fikk registreringen din")]
        [InlineData("en-US", "Welcome to the course!", "We received your registration")]
        public async Task Should_Create_New_User_And_Registration(string language, string subject, string body)
        {
            var client = this.factory.CreateClient();
            client.AcceptLanguage(language);

            using var scope = this.factory.Services.NewTestScope();

            
            using var eventInfo = await scope.CreateEventAsync();

            var emailExpectation = this.factory.EmailSenderMock
                .ExpectEmail()
                .SentTo(Email)
                .WithSubject(subject)
                .ContainingText(body)
                .Setup();

            var token = await client.GetAntiForgeryTokenAsync("/Account/Login");
            var response = await client.PostAsync($"/events/{eventInfo.Entity.EventInfoId}/{eventInfo.Entity.Code}/register",
                new Dictionary<string, string>
            {
                { "Email", Email },
                { "PhoneCountryCode", "+1" },
                { "Phone", "1111111111" },
                { "ParticipantName", "John Doe" },
                { "ParticipantJobTitle", "Head" },
                { "ParticipantCity", "Oslo" },
                { "Notes", "Testing" }
            }, token);

            Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync());

            var user = await scope.Db.Users.FirstOrDefaultAsync(u => u.Email == Email);
            Assert.NotNull(user);
            Assert.Equal("John Doe", user.Name);
            Assert.Equal(Email, user.UserName);
            Assert.Equal("+11111111111", user.PhoneNumber);

            var registration =
                await scope.Db.Registrations.FirstOrDefaultAsync(r =>
                    r.UserId == user.Id && r.EventInfoId == eventInfo.Entity.EventInfoId);

            Assert.NotNull(registration);
            Assert.Equal("John Doe", registration.ParticipantName);
            Assert.Equal("Head", registration.ParticipantJobTitle);
            Assert.Equal("Oslo", registration.ParticipantCity);
            Assert.Equal("Testing", registration.Notes);

            emailExpectation.VerifyEmailSent();
        }
    }
}
