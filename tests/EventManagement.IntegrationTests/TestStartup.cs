using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

using losol.EventManagement.Services.DbInitializers;
using losol.EventManagement.Config;

namespace losol.EventManagement.IntegrationTests
{
	public class TestStartup : Startup
	{
		public TestStartup(
			IConfiguration configuration,
			IWebHostEnvironment env) : base(configuration, env)
		{

		}

		public override void ConfigureServices(IServiceCollection services)
		{
            AppSettings = new AppSettings
            {
                EmailProvider = EmailProvider.Mock,
                SmsProvider = SmsProvider.Mock,
                UsePowerOffice = false,
                UseStripeInvoice = false
            };
			base.ConfigureServices(services);

			services.AddScoped<IDbInitializer, TestDbInitializer>();
		}

		public override void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILoggerFactory loggerFactory)
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
