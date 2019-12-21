using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;

namespace losol.EventManagement.IntegrationTests.Pages.Events
{
    public class EventPageTests : IClassFixture<CustomWebApplicationFactory<Startup>>
    {
        private readonly HttpClient _client;

        public EventPageTests(CustomWebApplicationFactory<Startup> factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task Request_ReturnsEventDetails_WhenEventidIsValid()
        {
            // Arrange

            // Act
            var response = await _client.GetAsync("/events/2/mangfold-beriker-arbeidsmiljoet/register");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

    }
}
