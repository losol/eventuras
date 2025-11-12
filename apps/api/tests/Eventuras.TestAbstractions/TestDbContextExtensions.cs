using Microsoft.EntityFrameworkCore;

namespace Eventuras.TestAbstractions;

public static class TestDbContextExtensions
{
    public static void Clean<T>(this DbSet<T> dbSet) where T : class => dbSet.RemoveRange(dbSet);
}
