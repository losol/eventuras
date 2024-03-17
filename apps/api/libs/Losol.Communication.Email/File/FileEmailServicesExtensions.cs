using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Losol.Communication.Email.File;

public static class FileEmailServicesExtensions
{
    public static IServiceCollection AddFileEmailServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddOptions<FileEmailConfig>()
            .ValidateDataAnnotations()
            .Bind(configuration);
        services.TryAddTransient<IEmailSender, FileEmailWriter>();
        return services;
    }
}
