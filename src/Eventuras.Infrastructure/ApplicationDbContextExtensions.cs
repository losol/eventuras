using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Infrastructure
{
    public static class ApplicationDbContextExtensions
    {
        public static async Task CreateAsync<T>(this DbContext context, T entity,
            CancellationToken cancellationToken = default)
        {
            await context.AddAsync(entity, cancellationToken);
            await context.SaveChangesAsync(cancellationToken);
            context.DisableChangeTracking(entity);
        }

        public static async Task UpdateAsync<T>(this DbContext context, T entity,
            CancellationToken cancellationToken = default)
        {
            context.Update(entity);
            await context.SaveChangesAsync(cancellationToken);
            context.DisableChangeTracking(entity);
        }

        public static async Task DeleteAsync<T>(this DbContext context, T entity,
            CancellationToken cancellationToken = default)
        {
            context.Remove(entity);
            await context.SaveChangesAsync(cancellationToken);
            context.DisableChangeTracking(entity);
        }

        public static void DisableChangeTracking<T>(this DbContext context, T entity)
        {
            context.Entry(entity).State = EntityState.Detached;
        }
    }
}
