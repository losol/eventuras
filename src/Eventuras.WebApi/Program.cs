using System.IO;
using System.Threading.Tasks;
using Eventuras.Services.DbInitializers;
using Eventuras.WebApi.Config;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Eventuras.WebApi
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var host = CreateHostBuilder(args).Build();

            // Get a dbinitializer and use it to seed the database
            using (var scope = host.Services.CreateScope())
            {
                var initializer = scope.ServiceProvider.GetRequiredService<IDbInitializer>();
                await initializer.SeedAsync();
            }

            await host.RunAsync();
        }

        private static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    var config = new ConfigurationBuilder()
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .AddJsonFile("appsettings.json", optional: false)
                        .AddUserSecrets<Startup>(true)
                        .AddEnvironmentVariables()
                        .Build();

                    var featureManagementSettings = new FeatureManagement();
                    config.GetSection("FeatureManagement").Bind(featureManagementSettings);

                    if (featureManagementSettings.UseSentry)
                    {
                        webBuilder.UseSentry();
                    }

                    webBuilder.UseStartup<Startup>();
                });
    }
}
