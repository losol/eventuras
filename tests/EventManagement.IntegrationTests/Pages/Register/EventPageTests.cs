using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;

using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using losol.EventManagement.IntegrationTests.Fixtures;
using Xunit;
using System.Linq;

namespace losol.EventManagement.IntegrationTests.Pages.Register
{
    public class EventPageTests : IClassFixture<TestFixture<Startup>>
    {
        private readonly HttpClient _client;
		private readonly TestFixture<Startup> _fixture;

		public EventPageTests(TestFixture<Startup> fixture)
        {
            _client = fixture.Client;
			_fixture = fixture;
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
            var response = await _client.GetAsync("/Register/Event/1000");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task Request_ReturnsEventDetails_WhenEventidIsValid()
        {
            // Arrange

            // Act
            var response = await _client.GetAsync("/Register/Event/1");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

    }
}
