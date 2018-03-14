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

		public EventPageTests(TestFixture<Startup> fixture, Xunit.Abstractions.ITestOutputHelper output)
        {
            _client = fixture.Client;
			_fixture = fixture;
			_output = output;
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
            var info = new EventInfo { 
                EventInfoId = 1,
                Title = "Just another event",
                Description = "With free food and swag",
                DateStart = DateTime.UtcNow.AddDays(3),
                DateEnd = DateTime.UtcNow.AddDays(5),
                Published = true
            };

			var _db = _fixture.Services.GetRequiredService<ApplicationDbContext>();
            _db.EventInfos.Add(info);
            await _db.SaveChangesAsync();
            

            // Act
            var response = await _client.GetAsync("/Register/Event/1");


			var responseString = await response.Content.ReadAsStringAsync();
			_output.WriteLine(responseString);
			_output.WriteLine(_db.EventInfos.Count()+"");


            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

		private readonly Xunit.Abstractions.ITestOutputHelper _output;

    }
}
