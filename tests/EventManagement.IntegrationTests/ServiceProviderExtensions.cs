using losol.EventManagement.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Threading.Tasks;

namespace losol.EventManagement.IntegrationTests
{
    public static class ServiceProviderExtensions
    {
        public const string Placeholder = "___Placeholder___";

        public static IServiceScope NewScope(this IServiceProvider serviceProvider)
        {
            return serviceProvider.GetRequiredService<IServiceScopeFactory>().CreateScope();
        }

        public static async Task<IDisposableEntity<ApplicationUser>> NewUserAsync(
            this IServiceProvider serviceProvider,
            string email = Placeholder,
            string password = Placeholder,
            params string[] roles)
        {
            var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

            if (email == Placeholder)
            {
                email = $"{Guid.NewGuid()}@email.com";
            }

            if (password == Placeholder)
            {
                password = Guid.NewGuid().ToString();
            }

            var user = new ApplicationUser
            {
                Name = email,
                UserName = email,
                Email = email,
                EmailConfirmed = true
            };

            await userManager.CreateAsync(user, password);

            if (roles.Length > 0)
            {
                await userManager.AddToRolesAsync(user, roles);
            }

            return new DisposableUser(user, userManager);
        }
    }
}
