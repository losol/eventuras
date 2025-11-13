using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Eventuras.Infrastructure;
using Eventuras.Services;
using Eventuras.Services.DbInitializers;
using Eventuras.Services.Organizations.Settings;
using Eventuras.Services.Pdf;
using Eventuras.WebApi.Tests.Controllers.Organizations;
using Losol.Communication.Email;
using Losol.Communication.Sms;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.IdentityModel.Tokens;
using Moq;

namespace Eventuras.WebApi.Tests;

public class CustomWebApiApplicationFactory<TStartup> : WebApplicationFactory<TStartup> where TStartup : class
{
    public readonly Mock<IEmailSender> EmailSenderMock = new();
    public readonly Mock<ISmsSender> SmsSenderMock = new();

    private class TestDbInitializer : IDbInitializer
    {
        private readonly RoleManager<IdentityRole> _roleManager;

        public TestDbInitializer(RoleManager<IdentityRole> roleManager)
        {
            _roleManager = roleManager;
        }

        public async Task SeedAsync(bool createSuperAdmin = true, bool runMigrations = false)
        {
            foreach (var role in Roles.All)
            {
                if (!await _roleManager.RoleExistsAsync(role))
                {
                    await _roleManager.CreateAsync(new IdentityRole(role));
                }
            }
        }
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSolutionRelativeContentRoot("src/Eventuras.WebApi")
            .UseEnvironment("IntegrationTests")
            .ConfigureAppConfiguration(app => app.AddInMemoryCollection(new Dictionary<string, string>
            {
                { "AppSettings:UsePowerOffice", "false" }, { "AppSettings:UseStripeInvoice", "false" }
            }))
            .ConfigureServices(services =>
            {
                // Override already added email sender with the true mock
                services.AddSingleton(EmailSenderMock.Object);
                services.AddSingleton(SmsSenderMock.Object);
                services.AddTransient<IPdfRenderService, DummyPdfRenderService>();
                services.AddSingleton<IOrganizationSettingsRegistryComponent, OrgSettingsTestRegistryComponent>();

                // Replace  ApplicationDbContext using a unique in-memory database for each test.
                services.RemoveAll(typeof(DbContextOptions<ApplicationDbContext>));
                var databaseName = $"eventuras-test-db-{Guid.NewGuid()}";
                services.AddDbContext<ApplicationDbContext>(options =>
                    options.UseInMemoryDatabase(databaseName));
            });

        builder.ConfigureTestServices(services =>
        {
            // Replace DbInitializer with test version that seeds Identity roles
            services.RemoveAll(typeof(IDbInitializer));
            services.AddSingleton<IDbInitializer, TestDbInitializer>();

            services.PostConfigure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme,
                options =>
                {
                    options.ConfigurationManager = null;
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        IssuerSigningKey = FakeJwtManager.SecurityKey,
                        ValidIssuer = FakeJwtManager.Issuer,
                        ValidAudience = FakeJwtManager.Audience
                    };
                });
        });
    }
}
