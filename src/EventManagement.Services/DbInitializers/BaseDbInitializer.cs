using System.Threading.Tasks;

namespace losol.EventManagement.Services.DbInitializers
{
    public abstract class BaseDbInitializer : IDbInitializer
    {
        public virtual Task SeedAsync()
        {
            throw new System.NotImplementedException();
        }
    }
}
