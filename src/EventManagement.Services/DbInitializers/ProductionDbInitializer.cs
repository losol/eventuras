using System.Threading.Tasks;

namespace losol.EventManagement.Services.DbInitializers
{
    public class ProductionDbInitializer : BaseDbInitializer, IDbInitializer
    {
        public override Task SeedAsync()
        {
            return base.SeedAsync();
        }
    }
}
