using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Infrastructure;
using losol.EventManagement.Services;
using losol.EventManagement.Services.DbInitializers;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace losol.EventManagement
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            // Build the application host
            var host = BuildWebHost(args);

            // Get a dbinitializer and use it to seed the database
            using(var scope = host.Services.CreateScope())
            {
                var initializer = scope.ServiceProvider.GetService<IDbInitializer>();
			    await initializer.SeedAsync();
            }

            // Run the application
            host.Run();
        }

        public static IWebHost BuildWebHost(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>()
                .Build();
    }
}
