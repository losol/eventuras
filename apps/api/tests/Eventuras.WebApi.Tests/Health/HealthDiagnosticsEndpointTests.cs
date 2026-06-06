using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Xunit;

namespace Eventuras.WebApi.Tests.Health;

public class HealthDiagnosticsEndpointTests : IClassFixture<CustomWebApiApplicationFactory<Program>>
{
    private readonly CustomWebApiApplicationFactory<Program> _factory;

    public HealthDiagnosticsEndpointTests(CustomWebApiApplicationFactory<Program> factory) =>
        _factory = factory;

    [Fact]
    public async Task Probe_Health_Excludes_Diagnostics_Checks()
    {
        // Register a "diagnostics"-tagged check that is Unhealthy. If diagnostics
        // checks were on the probe /health, it would return 503. It staying 200
        // proves the predicate excludes them — and so a pending migration (also
        // "diagnostics") can never flip the Kubernetes probes.
        var client = _factory
            .WithWebHostBuilder(b => b.ConfigureTestServices(services =>
                services.AddHealthChecks()
                    .AddCheck("forced-unhealthy", () => HealthCheckResult.Unhealthy(),
                        tags: ["diagnostics"])))
            .CreateClient();

        var response = await client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Diagnostics_Requires_Authentication()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/health/diagnostics");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Diagnostics_Forbids_Non_Admin()
    {
        var client = _factory.CreateClient().Authenticated();

        var response = await client.GetAsync("/health/diagnostics");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}
