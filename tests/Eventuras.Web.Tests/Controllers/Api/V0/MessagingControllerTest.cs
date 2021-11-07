using System;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Eventuras.IntegrationTests;
using Eventuras.TestAbstractions;
using Moq;
using Newtonsoft.Json;
using Xunit;

namespace Eventuras.Web.Tests.Controllers.Api.V0
{
    public class MessagingControllerTest : IClassFixture<CustomWebApplicationFactory<Startup>>, IDisposable
    {
        private readonly CustomWebApplicationFactory<Startup> factory;

        public MessagingControllerTest(CustomWebApplicationFactory<Startup> factory)
        {
            this.factory = factory;
        }

        public void Dispose()
        {
            this.factory.EmailSenderMock.Reset();
        }

        [Theory]
        [InlineData("nb-NO", "Velkommen til")]
        public async Task Should_Send_Register_Email(string languageCode, string textToCheck)
        {
            var client = this.factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = this.factory.Services.NewTestScope();

            var eventInfo = SeedData.Events[0];
            using var user = await scope.CreateUserAsync();
            using var registration = await scope.CreateRegistrationAsync(eventInfo, user.Entity);

            var emailExpectation = this.factory.EmailSenderMock
                .ExpectEmail()
                .SentTo(user.Entity.Email)
                .WithSubject("Test")
                .ContainingHtml("Test Email Contents")
                .ContainingHtml(textToCheck)
                .Setup();

            client.AcceptLanguage(languageCode);
            var response = await client.PostAsync($"/api/v0/messaging/email/participants-at-event/{eventInfo.EventInfoId}",
                new StringContent(JsonConvert.SerializeObject(new
                {
                    Subject = "Test",
                    Content = "Test Email Contents"
                }), Encoding.UTF8, "application/json"));

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            Assert.DoesNotContain("Sendte epost. Men fikk noen feil", content);

            emailExpectation.VerifyEmailSent(Times.Once());
        }
    }
}
