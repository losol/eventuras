using System;
using System.Linq;
using System.Reflection;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.AspNetCore.Mvc.Razor.RuntimeCompilation;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;

namespace Eventuras.Services;

public static class MvcServiceCollectionExtensions
{
    public static IServiceCollection AddMvcApplicationParts(this IServiceCollection services, Assembly assembly)
    {
        var serviceDescriptor = services.Single(sd => sd.ServiceType == typeof(ApplicationPartManager));

        var partManager = serviceDescriptor.ImplementationInstance as ApplicationPartManager
                       ?? throw new Exception($"{nameof(MvcServiceCollectionExtensions)}.{nameof(AddMvcApplicationParts)}"
                                            + $" must be called after {nameof(IServiceCollection)}.AddControllersWithViews");

        var partFactory = ApplicationPartFactory.GetApplicationPartFactory(assembly);
        foreach (var applicationPart in partFactory.GetApplicationParts(assembly)) partManager.ApplicationParts.Add(applicationPart);

        services.Configure<MvcRazorRuntimeCompilationOptions>(options => { options.FileProviders.Add(new EmbeddedFileProvider(assembly)); });

        return services;
    }
}