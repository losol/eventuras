using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;

namespace losol.EventManagement.Services.DbInitializers
{
    public class ProductionDbInitializer : BaseDbInitializer, IDbInitializer
    {
        public ProductionDbInitializer(ApplicationDbContext db, RoleManager<IdentityRole> roleManager,  UserManager<ApplicationUser> userManager, IOptions<DbInitializerOptions> config)
            : base(db, roleManager, userManager, config)
         { }
        
        public override Task SeedAsync()
        {
            _db.Database.Migrate(); // FIXME: Do not do this in production!
            return base.SeedAsync();
        }
    }
}
