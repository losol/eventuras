using System.Threading.Tasks;

namespace losol.EventManagement.Services.DbInitializers
{
    public class DevelopmentDbInitializer : BaseDbInitializer, IDbInitializer
    {
        public override Task SeedAsync()
        {
            return base.SeedAsync();
        }
    }
}
