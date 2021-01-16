using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Infrastructure
{
    public static class ApplicationDbContextExtensions
    {
        public static async Task UpdateAsync<T>(this ApplicationDbContext context, T entity, CancellationToken cancellationToken = default)
        {
            context.Update(entity);
            await context.SaveChangesAsync(cancellationToken);
        }
    }
}
