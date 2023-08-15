using Microsoft.AspNetCore.Mvc.Localization;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Eventuras.Services.Views;

public static class ViewsServiceCollectionExtensions
{
    public static IServiceCollection AddViewServices(this IServiceCollection services)
    {
        services.AddScoped<IViewRenderService, ViewRenderService>();
        services.AddMvcApplicationParts(typeof(ViewsServiceCollectionExtensions).Assembly);
        services.AddLocalization(options => options.ResourcesPath = "Resources");
        services.TryAdd(ServiceDescriptor.Singleton<IHtmlLocalizerFactory, HtmlLocalizerFactory>());
        services.TryAdd(ServiceDescriptor.Transient(typeof(IHtmlLocalizer<>), typeof(HtmlLocalizer<>)));
        services.TryAdd(ServiceDescriptor.Transient<IViewLocalizer, ViewLocalizer>());
        return services;
    }
}