using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;

using losol.EventManagement.IntegrationTests.Fixtures;


namespace losol.EventManagement.IntegrationTests.Pages
{
	public class IndexPageTests : IClassFixture<TestFixture<Startup>>
	{
		private readonly HttpClient _client;

		public IndexPageTests(TestFixture<Startup> fixture)
		{
			_client = fixture.Client;
		}

		[Fact]
		public async Task Request_ReturnsOK()
		{
			// Act
			var response = await _client.GetAsync("/");

			// Assert
			Assert.Equal(HttpStatusCode.OK, response.StatusCode);
		}
	}
}
