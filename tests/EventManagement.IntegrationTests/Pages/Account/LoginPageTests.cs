using Moq;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using Xunit;

namespace losol.EventManagement.IntegrationTests.Pages.Account
{
    public class LoginPageTests : IClassFixture<CustomWebApplicationFactory<Startup>>
    {
        private readonly CustomWebApplicationFactory<Startup> factory;

        public LoginPageTests(CustomWebApplicationFactory<Startup> factory)
        {
            this.factory = factory;
        }

        [Theory]
        [InlineData("nb-NO", "Logg inn")]
        [InlineData("en-US", "Sign in")]
        public async Task Should_Send_Magic_Link_Email(string languageCode, string textToCheck)
        {
            var client = this.factory.CreateClient();
            client.AcceptLanguage(languageCode);

            using var scope = this.factory.Services.NewScope();
            using var user = await scope.ServiceProvider.NewUserAsync();

            var emailExpectation = this.factory.EmailSenderMock
                .ExpectEmail()
                .SentTo(user.Entity.Email)
                .WithSubject("Innloggingslenke Kursinord.no")
                .ContainingText("/magic")
                .ContainingText(textToCheck)
                .Setup();

            var response = await client.PostAsync($"/Account/Login?handler=SendMagicLink", new Dictionary<string, string>
            {
                { "Email", user.Entity.Email }
            });

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            emailExpectation.VerifyEmailSent(Times.Once());
        }
    }
}
