using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

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
