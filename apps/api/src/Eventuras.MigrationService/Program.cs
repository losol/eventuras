using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.DbInitializers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

// Applies pending migrations and seeds reference data, then exits.
//
// Migrating from a short-lived process rather than from the API keeps local
// development the same shape as a deployment: the schema is brought up by a
// separate, controlled step, and the API only ever reads a database that is
// already current. The AppHost runs this to completion before starting the API.
var builder = Host.CreateApplicationBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("Connection string 'DefaultConnection' is not set.");
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString, npgsql => npgsql.UseNodaTime()));
builder.Services.AddScoped<IDbInitializer, DbInitializer>();

var host = builder.Build();
var logger = host.Services.GetRequiredService<ILogger<Program>>();

await using (var scope = host.Services.CreateAsyncScope())
{
    var initializer = scope.ServiceProvider.GetRequiredService<IDbInitializer>();

    logger.LogInformation("Applying database migrations");
    await initializer.SeedAsync(runMigrations: true);
    logger.LogInformation("Database is up to date");

    // The API reads SMTP from organization settings, so development mail only reaches Mailpit
    // once those rows exist. Written here rather than in the seeder because the address is a
    // property of this stack, not of the product; deployments pass nothing and nothing is written.
    var smtpHost = builder.Configuration["DevelopmentSmtp:Host"];
    if (!string.IsNullOrWhiteSpace(smtpHost))
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var organizationId = await db.Organizations
            .OrderBy(o => o.OrganizationId)
            .Select(o => o.OrganizationId)
            .FirstOrDefaultAsync();

        if (organizationId == 0)
        {
            logger.LogWarning("No organization to configure development SMTP for");
        }
        else
        {
            var settings = new Dictionary<string, string>
            {
                ["OrganizationSmtpSettings.Host"] = smtpHost,
                ["OrganizationSmtpSettings.Port"] = builder.Configuration["DevelopmentSmtp:Port"] ?? "1025",
                ["OrganizationSmtpSettings.User"] = string.Empty,
                ["OrganizationSmtpSettings.Password"] = string.Empty,
                ["OrganizationSmtpSettings.FromAddress"] =
                    builder.Configuration["DevelopmentSmtp:FromAddress"] ?? "no-reply@localhost",
                ["OrganizationSmtpSettings.FromName"] =
                    builder.Configuration["DevelopmentSmtp:FromName"] ?? "Eventuras",
                ["OrganizationSmtpSettings.Enabled"] = "true"
            };

            var existing = await db.OrganizationSettings
                .Where(s => s.OrganizationId == organizationId && settings.Keys.Contains(s.Name))
                .ToListAsync();

            foreach (var (name, value) in settings)
            {
                var row = existing.Find(s => s.Name == name);
                if (row == null)
                {
                    db.OrganizationSettings.Add(new OrganizationSetting
                    {
                        OrganizationId = organizationId,
                        Name = name,
                        Value = value
                    });
                }
                else
                {
                    row.Value = value;
                }
            }

            await db.SaveChangesAsync();
            logger.LogInformation(
                "Development SMTP for organization {OrganizationId} points at {Host}",
                organizationId, smtpHost);
        }
    }
}

return 0;

public partial class Program
{
}
