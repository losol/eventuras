using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

using losol.EventManagement.Services.DbInitializers;

namespace losol.EventManagement.IntegrationTests
{
	public class TestStartup : Startup
	{
		public TestStartup(
			IConfiguration configuration, 
			IHostingEnvironment env) : base(configuration, env)
		{
			
		}

		public override void ConfigureServices(IServiceCollection services)
		{
			base.ConfigureServices(services);

			services.AddScoped<IDbInitializer, TestDbInitializer>();
		}

		public override void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
		{
			base.Configure(app, env, loggerFactory);

			using (var serviceScope = app.ApplicationServices.GetRequiredService<IServiceScopeFactory>().CreateScope())
			{
				var initializer = serviceScope.ServiceProvider.GetService<IDbInitializer>();
				initializer.SeedAsync().Wait();
			}
		}
	}
}
