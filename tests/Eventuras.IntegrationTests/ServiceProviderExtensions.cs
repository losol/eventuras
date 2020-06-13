using Eventuras.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Threading.Tasks;

namespace Eventuras.IntegrationTests
{
    public static class ServiceProviderExtensions
    {
        public const string Placeholder = "___Placeholder___";
        public const string DefaultPassword = "MySuperSecretPassword1!";

        public static IServiceScope NewScope(this IServiceProvider serviceProvider)
        {
            return serviceProvider.GetRequiredService<IServiceScopeFactory>().CreateScope();
        }

        public static async Task<IDisposableEntity<ApplicationUser>> CreateUserAsync(
            this IServiceProvider serviceProvider,
            string email = Placeholder,
            string password = Placeholder,
            string phone = Placeholder,
            string[] roles = null)
        {
            var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

            if (email == Placeholder)
            {
                email = $"{Guid.NewGuid()}@email.com";
            }

            if (password == Placeholder)
            {
                password = DefaultPassword;
            }

            if (phone == Placeholder)
            {
                phone = "+11111111111";
            }

            var user = new ApplicationUser
            {
                Name = email,
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                PhoneNumber = phone,
                PhoneNumberConfirmed = !string.IsNullOrEmpty(phone)
            };

            await userManager.CreateAsync(user, password);

            if (roles?.Length > 0)
            {
                await userManager.AddToRolesAsync(user, roles);
            }

            return new DisposableUser(user, userManager);
        }
    }
}
