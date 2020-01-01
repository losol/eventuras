using Microsoft.AspNetCore.Mvc.Testing;
using Newtonsoft.Json;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using losol.EventManagement.Infrastructure;
using losol.EventManagement.Services;
using Microsoft.Extensions.DependencyInjection;
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

        [Fact]
        public async Task Should_Send_Register_Email()
        {
            const string email = "test@email.com";
            const string password = "MySecretPassword1!";

            var eventInfo = SeedData.Events[0];

            using var scope = this.factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            using (await scope.ServiceProvider.NewUserAsync(email, password, Roles.Admin))
            {
                await this.client.LoginAsync(email, password);

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
            }
        }
    }
}
