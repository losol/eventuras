using System;
using System.Net.Http;
using System.Reflection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

using losol.EventManagement.Infrastructure;
using Microsoft.Extensions.Configuration;

namespace losol.EventManagement.IntegrationTests.Fixtures
{
    // A test fixture which hosts the target project in an in-memory server.
    public class TestFixture<TStartup> : IDisposable
    {
        private readonly TestServer _server;
        public HttpClient Client { get; }
        public IServiceProvider Services => _server.Host.Services;

		public TestFixture()
        {
			var builder = new WebHostBuilder()
				.UseContentRoot("../../../../../src/EventManagement.Web")
				.UseEnvironment("Development")
				.ConfigureAppConfiguration(app =>
                {
                    app.AddJsonFile("appsettings.json");
                })
				.UseStartup<TestStartup>()
				.ConfigureServices(ConfigureServices);

			_server = new TestServer(builder);

			Client = _server.CreateClient();
			Client.BaseAddress = _server.BaseAddress;
        }


        public void Dispose()
        {
            Client.Dispose();
            _server.Dispose();
        }

		protected virtual void ConfigureServices(IServiceCollection services)
        {
			services.AddEntityFrameworkInMemoryDatabase();
			services.AddDbContext<ApplicationDbContext>(options => {
				options.UseInMemoryDatabase("losol-eventmanagement-itests");
			});

			var startupAssembly = typeof(Startup).GetTypeInfo().Assembly;
            var manager = new ApplicationPartManager();
            manager.ApplicationParts.Add(new AssemblyPart(startupAssembly));
            manager.FeatureProviders.Add(new ControllerFeatureProvider());
            manager.FeatureProviders.Add(new ViewComponentFeatureProvider());
            services.AddSingleton(manager);
        }

    }
}
