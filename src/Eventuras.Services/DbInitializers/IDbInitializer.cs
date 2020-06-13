using System.Threading.Tasks;

namespace Eventuras.Services.DbInitializers
{
    public interface IDbInitializer
    {
        Task SeedAsync();
    }
}
