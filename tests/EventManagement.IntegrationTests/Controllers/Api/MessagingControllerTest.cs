using losol.EventManagement.Infrastructure;
using Losol.Communication.Email;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Newtonsoft.Json;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace losol.EventManagement.IntegrationTests.Controllers.Api
{
    public class MessagingControllerTest : IClassFixture<CustomWebApplicationFactory<Startup>>
    {
        private readonly CustomWebApplicationFactory<Startup> factory;
        private readonly HttpClient client;

        public MessagingControllerTest(CustomWebApplicationFactory<Startup> factory)
        {
            this.factory = factory;
            this.client = factory.CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false
            });
        }

        [Theory]
        [InlineData("nb-NO", "Velkommen til")]
        [InlineData("en-US", "Welcome to")]
        public async Task Should_Send_Register_Email(string languageCode, string textToCheck)
        {
            this.client.DefaultRequestHeaders.AcceptLanguage.Add(new StringWithQualityHeaderValue(languageCode));
            await this.client.LogInAsSuperAdminAsync();

            var eventInfo = SeedData.Events[0];

            this.factory.EmailSenderMock.Setup(s => s.SendEmailAsync(
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<Attachment>(),
                    EmailMessageType.Html))
                .Callback((string email, string subject, string html, Attachment attachment, EmailMessageType emailType) =>
                {
                    Assert.Contains(textToCheck, html);
                });

            using var scope = this.factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            using var user = await scope.ServiceProvider.NewUserAsync();
            using var registration = await context.NewRegistrationAsync(eventInfo, user.Entity);

            var response = await this.client.PostAsync($"/api/v0/messaging/email/participants-at-event/{eventInfo.EventInfoId}",
                new StringContent(JsonConvert.SerializeObject(new
                {
                    Subject = "Test",
                    Content = "Test Email Contents"
                }), Encoding.UTF8, "application/json"));

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            Assert.DoesNotContain("Sendte epost. Men fikk noen feil", content);

            this.factory.EmailSenderMock.Verify(s => s.SendEmailAsync(user.Entity.Email, "Test",
                It.Is<string>(html => html.Contains("Test Email Contents")),
                It.IsAny<Attachment>(),
                EmailMessageType.Html));
        }
    }
}
