using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using Eventuras.IntegrationTests;
using Eventuras.TestAbstractions;
using Moq;
using Xunit;

namespace Eventuras.Web.Tests.Pages.Account
{
    public class LoginPageTests : IClassFixture<CustomWebApplicationFactory<Startup>>, IDisposable
    {
        private readonly CustomWebApplicationFactory<Startup> factory;

        public LoginPageTests(CustomWebApplicationFactory<Startup> factory)
        {
            this.factory = factory;
        }

        public void Dispose()
        {
            this.factory.EmailSenderMock.Reset();
        }

        [Theory]
        [InlineData("nb-NO", "Logg inn", "Innloggingslenke Kursinord.no")]
        public async Task Should_Send_Magic_Link_Email(string languageCode, string textToCheck, string subject)
        {
            var client = this.factory.CreateClient();
            client.AcceptLanguage(languageCode);

            using var scope = this.factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();

            var emailExpectation = this.factory.EmailSenderMock
                .ExpectEmail()
                .SentTo(user.Entity.Email)
                .WithSubject(subject)
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
