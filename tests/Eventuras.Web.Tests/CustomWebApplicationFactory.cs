using System.Collections.Generic;
using System.Linq;
using Eventuras.Infrastructure;
using Eventuras.Services.DbInitializers;
using Eventuras.Services.Invoicing;
using Eventuras.TestAbstractions;
using Eventuras.Web.Tests;
using Losol.Communication.Email;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Moq;

namespace Eventuras.IntegrationTests
{
    public class CustomWebApplicationFactory<TStartup>
        : WebApplicationFactory<TStartup> where TStartup : class
    {
        public readonly Mock<IEmailSender> EmailSenderMock = new Mock<IEmailSender>();

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder
                .UseSolutionRelativeContentRoot("src/Eventuras.Web")
                .UseEnvironment("Development")
                .ConfigureAppConfiguration(app => app
                    .AddInMemoryCollection(new Dictionary<string, string>
                    {
                        {"AppSettings:EmailProvider", "Mock"},
                        {"AppSettings:SmsProvider", "Mock"},
                        {"AppSettings:UsePowerOffice", "false"},
                        {"AppSettings:UseStripeInvoice", "false"},
                        {"SuperAdmin:Email", TestingConstants.SuperAdminEmail},
                        {"SuperAdmin:Password", TestingConstants.SuperAdminPassword}
                    }))
                .ConfigureServices(services =>
                {
                    // Override already added email sender with the true mock
                    services.AddSingleton(this.EmailSenderMock.Object);

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
                    services.AddTransient<IInvoicingProvider, TestInvoicingProvider>();

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
