using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.Services.Users;

public static class UserServiceCollectionExtensions
{
    public static IServiceCollection AddUserServices(this IServiceCollection services)
    {
        services.AddTransient<IUserRetrievalService, UserRetrievalService>();
        services.AddTransient<IUserManagementService, UserManagementService>();
        return services;
    }
}