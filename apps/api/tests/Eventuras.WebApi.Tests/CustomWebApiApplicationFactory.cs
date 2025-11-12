using System;
using System.Collections.Generic;
using Eventuras.Infrastructure;
using Eventuras.Services.Organizations.Settings;
using Eventuras.Services.Pdf;
using Eventuras.WebApi.Tests.Controllers.Organizations;
using Losol.Communication.Email;
using Losol.Communication.Sms;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
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
