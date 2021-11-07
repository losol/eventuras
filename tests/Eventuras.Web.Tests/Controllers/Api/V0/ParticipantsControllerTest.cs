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
    public class ParticipantsControllerTest : IClassFixture<CustomWebApplicationFactory<Startup>>, IDisposable
    {
        private readonly CustomWebApplicationFactory<Startup> factory;

        public ParticipantsControllerTest(CustomWebApplicationFactory<Startup> factory)
        {
            this.factory = factory;
        }

        public void Dispose()
        {
            this.factory.EmailSenderMock.Reset();
        }

        [Theory]
        [InlineData("nb-NO", "Nordland legeforening")]
        public async Task Should_Send_Email_To_Participants(string languageCode, string textToCheck)
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
            var response = await client.PostAsync($"/api/participants/order_emails/{eventInfo.EventInfoId}",
                new StringContent(JsonConvert.SerializeObject(new
                {
                    Subject = "Test",
                    Message = "Test Email Contents"
                }), Encoding.UTF8, "application/json"));

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            emailExpectation.VerifyEmailSent(Times.Once());
        }
    }
}
