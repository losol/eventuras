using Eventuras.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using System;

namespace Eventuras.TestAbstractions
{
    public class TestServiceScope : IServiceScope
    {
        private readonly IServiceScope _scope;

        public TestServiceScope(IServiceScope scope)
        {
            _scope = scope;
        }

        public T GetService<T>()
        {
            return _scope.ServiceProvider.GetRequiredService<T>();
        }

        public ApplicationDbContext Db => GetService<ApplicationDbContext>();

        public void Dispose()
        {
            _scope.Dispose();
        }

        public IServiceProvider ServiceProvider => _scope.ServiceProvider;
    }
}