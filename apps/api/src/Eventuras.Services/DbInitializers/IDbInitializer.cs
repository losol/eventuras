using System.Threading.Tasks;

namespace Eventuras.Services.DbInitializers;

public interface IDbInitializer
{
    Task SeedAsync(
        bool createSuperAdmin = true,
        bool runMigrations = false);
}
