using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Infrastructure;

public static class ApplicationDbContextExtensions
{
    public static async Task<T> CreateAsync<T>(this DbContext context, T entity,
        bool leaveAttached = false,
        CancellationToken cancellationToken = default)
    {
        await context.AddAsync(entity, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
        if (!leaveAttached)
        {
            context.DisableChangeTracking(entity);
        }

        return entity;
    }

    public static async Task<T> UpdateAsync<T>(this DbContext context, T entity,
        CancellationToken cancellationToken = default)
    {
        var wasAttached = context.Entry(entity).State != EntityState.Detached;
        context.Update(entity);
        await context.SaveChangesAsync(cancellationToken);
        if (!wasAttached)
        {
            context.DisableChangeTracking(entity);
        }

        return entity;
    }

    public static async Task DeleteAsync<T>(this DbContext context, T entity,
        CancellationToken cancellationToken = default)
    {
        context.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
        context.DisableChangeTracking(entity);
    }

    public static void DisableChangeTracking<T>(this DbContext context, T entity) =>
        context.Entry(entity).State = EntityState.Detached;
}
