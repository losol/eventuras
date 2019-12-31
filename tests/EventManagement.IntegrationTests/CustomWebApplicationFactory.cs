using losol.EventManagement.Infrastructure;
using losol.EventManagement.Services.DbInitializers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Collections.Generic;
using System.Linq;

namespace losol.EventManagement.IntegrationTests
{
    public class CustomWebApplicationFactory<TStartup>
        : WebApplicationFactory<TStartup> where TStartup : class
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder
                .UseSolutionRelativeContentRoot("src/EventManagement.Web")
                .UseEnvironment("Development")
                .ConfigureAppConfiguration(app => app
                    .AddInMemoryCollection(new Dictionary<string, string>
                    {
                        { "AppSettings:EmailProvider", "Mock" },
                        { "AppSettings:SmsProvider", "Mock" },
                        { "AppSettings:UsePowerOffice", "false" },
                        { "AppSettings:UseStripeInvoice", "false" }
                    }))
                .ConfigureServices(services =>
            {
                // Remove the app's ApplicationDbContext registration.
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType ==
                         typeof(DbContextOptions<ApplicationDbContext>));

                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                // Add ApplicationDbContext using an in-memory database for testing.
                services.AddDbContext<ApplicationDbContext>(options =>
                {
                    options.UseInMemoryDatabase("losol-eventmanagement-itests");
                });

                services.AddScoped<IDbInitializer, TestDbInitializer>();

                // Build the service provider.
                var sp = services.BuildServiceProvider();

                // Create a scope to obtain a reference to the database
                // context (ApplicationDbContext).
                using var scope = sp.CreateScope();
                var initializer = scope.ServiceProvider.GetRequiredService<IDbInitializer>();
                initializer.SeedAsync().Wait();
            });
        }
    }
}
