using System.Diagnostics;
using System.Threading.Tasks;
using losol.EventManagement.Services.DbInitializers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Builder;
using System.IO;

namespace losol.EventManagement
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            // Build the application host
            var host = CreateHostBuilder(args).Build();

            // Get a dbinitializer and use it to seed the database
            using (var scope = host.Services.CreateScope())
            {
                var initializer = scope.ServiceProvider.GetService<IDbInitializer>();
                await initializer.SeedAsync();
            }

            // Run the application
            host.Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    var config = new ConfigurationBuilder()
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .AddJsonFile("appsettings.json", optional: false)
                        .AddUserSecrets<Startup>()
                        .AddEnvironmentVariables()
                        .Build();

                    var useSentry = false;
                    bool.TryParse(config.GetSection("FeatureManagement:Sentry").Value.ToString(), out useSentry);
                    if (useSentry) {
                        webBuilder.UseSentry();
                    }
                    
                    webBuilder.UseStartup<Startup>();
                });
    }
}
