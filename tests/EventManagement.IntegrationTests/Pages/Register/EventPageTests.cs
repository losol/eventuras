using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using losol.EventManagement.IntegrationTests.Fixtures;
using Xunit;

namespace losol.EventManagement.IntegrationTests.Pages.Register
{
    public class EventPageTests : IClassFixture<TestFixture<Startup>>
    {
        private readonly HttpClient _client;

        public EventPageTests(TestFixture<Startup> fixture)
        {
            _client = fixture.Client;
        }

        [Fact]
        public async Task Request_ReturnsNotFound_WhenEventIdIsMissing()
        {
            // Act
            var response = await _client.GetAsync("/Register/Event");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task Request_ReturnsNotFound_WhenEventIdIsInvalid()
        {
            // Act
            var response = await _client.GetAsync("/Register/Event/1");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }
}
