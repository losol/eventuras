using System.Diagnostics;
using System.Threading.Tasks;
using Eventuras.Services.DbInitializers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Builder;
using System.IO;

namespace Eventuras
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            // Build the application host
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    var config = new ConfigurationBuilder()
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .AddJsonFile("appsettings.json", optional: false)
                        .AddUserSecrets<Startup>(true)
                        .AddEnvironmentVariables()
                        .Build();

                    var useSentry = false;
                    bool.TryParse(config.GetSection("FeatureManagement:Sentry").Value.ToString(), out useSentry);
                    if (useSentry)
                    {
                        webBuilder.UseSentry();
                    }

                    webBuilder.UseStartup<Startup>();
                });
    }
}
