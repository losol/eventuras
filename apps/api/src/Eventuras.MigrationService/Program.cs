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
}

return 0;

public partial class Program
{
}
