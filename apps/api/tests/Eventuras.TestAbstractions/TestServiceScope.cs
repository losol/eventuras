using System;
using Eventuras.Infrastructure;
using Microsoft.Extensions.DependencyInjection;

namespace Eventuras.TestAbstractions;

public class TestServiceScope : IServiceScope
{
    private readonly IServiceScope _scope;

    public TestServiceScope(IServiceScope scope) => _scope = scope;

    public ApplicationDbContext Db => GetService<ApplicationDbContext>();

    public void Dispose() => _scope.Dispose();

    public IServiceProvider ServiceProvider => _scope.ServiceProvider;

    public T GetService<T>() => _scope.ServiceProvider.GetRequiredService<T>();
}
