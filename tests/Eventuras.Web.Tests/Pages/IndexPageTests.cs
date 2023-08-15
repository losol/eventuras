using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Eventuras.IntegrationTests;
using Xunit;

namespace Eventuras.Web.Tests.Pages;

public class IndexPageTests : IClassFixture<CustomWebApplicationFactory<Startup>>
{
    private readonly HttpClient _client;

    public IndexPageTests(CustomWebApplicationFactory<Startup> factory)
    {
        _client = factory.CreateClient();
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