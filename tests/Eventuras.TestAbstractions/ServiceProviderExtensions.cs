using Microsoft.Extensions.DependencyInjection;
using System;

namespace Eventuras.TestAbstractions
{
    public static class ServiceProviderExtensions
    {
        public static TestServiceScope NewTestScope(this IServiceProvider serviceProvider)
        {
            var scope = serviceProvider.GetRequiredService<IServiceScopeFactory>().CreateScope();
            return new TestServiceScope(scope);
        }
    }
}
