using Eventuras.Infrastructure;
using Eventuras.Services.DbInitializers;
using Losol.Communication.Email;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using System.Collections.Generic;
using System.Linq;
using Eventuras.TestAbstractions;
using Eventuras.WebApi.Auth;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;

namespace Eventuras.WebApi.Tests
{
    public class CustomWebApiApplicationFactory<TStartup>
        : WebApplicationFactory<TStartup> where TStartup : class
    {
        public readonly Mock<IEmailSender> EmailSenderMock = new Mock<IEmailSender>();

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder
                .UseSolutionRelativeContentRoot("src/Eventuras.WebApi")
                .UseEnvironment("Development")
                .ConfigureAppConfiguration(app => app
                    .AddInMemoryCollection(new Dictionary<string, string>
                    {
                        { "AppSettings:EmailProvider", "Mock" },
                        { "AppSettings:SmsProvider", "Mock" },
                        { "AppSettings:UsePowerOffice", "false" },
                        { "AppSettings:UseStripeInvoice", "false" },
                        { "SuperAdmin:Email", TestingConstants.SuperAdminEmail },
                        { "SuperAdmin:Password", TestingConstants.SuperAdminPassword }
                    }))
                .ConfigureServices(services =>
                {
                    // Override already added email sender with the true mock
                    services.AddSingleton(EmailSenderMock.Object);

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

                    services.AddScoped<IDbInitializer, TestDbInitializer>();

                    // Build the service provider.
                    var sp = services.BuildServiceProvider();

                    // Create a scope to obtain a reference to the database
                    // context (ApplicationDbContext).
                    using var scope = sp.CreateScope();
                    var initializer = scope.ServiceProvider.GetRequiredService<IDbInitializer>();
                    initializer.SeedAsync().Wait();
                });

            builder.ConfigureTestServices(services =>
            {
                services.PostConfigure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        IssuerSigningKey = FakeJwtManager.SecurityKey,
                        ValidIssuer = FakeJwtManager.Issuer,
                        ValidAudience = FakeJwtManager.Audience
                    };
                });

                services.PostConfigure<AuthorizationOptions>(options =>
                {
                    foreach (var scope in TestingConstants.DefaultScopes) // replace default scope policies having original auth0 Issuer
                    {
                        options.AddPolicy(scope, policy =>
                        {
                            policy.Requirements.Add(new ScopeRequirement(FakeJwtManager.Issuer, scope));
                        });
                    }
                });
            });
        }
    }
}
