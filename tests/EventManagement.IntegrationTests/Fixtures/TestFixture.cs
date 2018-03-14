using System;
using System.IO;
using System.Net.Http;
using System.Reflection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;

using losol.EventManagement.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace losol.EventManagement.IntegrationTests.Fixtures
{
    // A test fixture which hosts the target project (project we wish to test) in an in-memory server.
    public class TestFixture<TStartup> : IDisposable
    {
        private readonly TestServer _server;
        public HttpClient Client { get; }
        public IServiceProvider Services => _server.Host.Services;

		public TestFixture()
        {
			var startupAssembly = typeof(TStartup).GetTypeInfo().Assembly;

			var builder = new WebHostBuilder()
				.UseContentRoot("../../../../../src/EventManagement.Web")
				.ConfigureServices(InitializeServices)
				.UseEnvironment("Development")
				.UseStartup(typeof(TStartup));

			_server = new TestServer(builder);

			Client = _server.CreateClient();
			Client.BaseAddress = _server.BaseAddress;
        }


        public void Dispose()
        {
            Client.Dispose();
            _server.Dispose();
        }

        protected virtual void InitializeServices(IServiceCollection services)
        {
			services.AddEntityFrameworkInMemoryDatabase().BuildServiceProvider();
			services.AddDbContext<ApplicationDbContext>(options => {
				options.UseInMemoryDatabase("losol-eventmanagement-itests");
			});

            var startupAssembly = typeof(TStartup).GetTypeInfo().Assembly;
            var manager = new ApplicationPartManager();
            manager.ApplicationParts.Add(new AssemblyPart(startupAssembly));
            manager.FeatureProviders.Add(new ControllerFeatureProvider());
            manager.FeatureProviders.Add(new ViewComponentFeatureProvider());
            services.AddSingleton(manager);
        }

    }
}
