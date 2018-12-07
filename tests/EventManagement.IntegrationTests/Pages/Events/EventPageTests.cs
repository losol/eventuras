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

namespace losol.EventManagement.IntegrationTests.Pages.Events
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
