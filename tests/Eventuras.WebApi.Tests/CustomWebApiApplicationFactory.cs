using Eventuras.Infrastructure;
using Eventuras.Services.DbInitializers;
using Eventuras.Services.Organizations.Settings;
using Eventuras.Services.Pdf;
using Eventuras.TestAbstractions;
using Eventuras.WebApi.Auth;
using Eventuras.WebApi.Tests.Controllers.Organizations;
using Losol.Communication.Email;
using Losol.Communication.Sms;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Moq;
using System.Collections.Generic;
using System.Linq;

namespace Eventuras.WebApi.Tests
{
    public class CustomWebApiApplicationFactory<TStartup>
        : WebApplicationFactory<TStartup> where TStartup : class
    {
        public readonly Mock<IEmailSender> EmailSenderMock = new();
        public readonly Mock<ISmsSender> SmsSenderMock = new();

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder
                .UseSolutionRelativeContentRoot("src/Eventuras.WebApi")
                .UseEnvironment("Development")
                .ConfigureAppConfiguration(app => app
                    .AddInMemoryCollection(new Dictionary<string, string>
                    {
                        { "AppSettings:UsePowerOffice", "false" },
                        { "AppSettings:UseStripeInvoice", "false" },

                    }))
                .ConfigureServices(services =>
                {
                    // Override already added email sender with the true mock
                    services.AddSingleton(EmailSenderMock.Object);
                    services.AddSingleton(SmsSenderMock.Object);
                    services.AddTransient<IPdfRenderService, DummyPdfRenderService>();
                    services.AddSingleton<IOrganizationSettingsRegistryComponent, OrgSettingsTestRegistryComponent>();

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
                        options.UseInMemoryDatabase("eventuras-web-api-tests");
                    });

                    // Build the service provider.
                    var sp = services.BuildServiceProvider();

                    // Create a scope to obtain a reference to the database
                    // context (ApplicationDbContext).
                    using var scope = sp.CreateScope();

                    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                    db.Database.EnsureCreatedAsync().Wait();

                    var initializer = scope.ServiceProvider.GetRequiredService<IDbInitializer>();
                    initializer.SeedAsync(createSuperAdmin: false, false).Wait();
                });

            builder.ConfigureTestServices(services =>
            {
                services.PostConfigure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
                {
                    options.ConfigurationManager = null;
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        IssuerSigningKey = FakeJwtManager.SecurityKey,
                        ValidIssuer = FakeJwtManager.Issuer,
                        ValidAudience = FakeJwtManager.Audience,

                    };
                });
            });
        }
    }
}
