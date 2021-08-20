using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

using Eventuras.Domain;
using Eventuras.Infrastructure;
using System.Linq;

namespace Eventuras.Services.DbInitializers
{
    public class DevelopmentDbInitializer : BaseDbInitializer, IDbInitializer
    {
        public DevelopmentDbInitializer(ApplicationDbContext db, RoleManager<IdentityRole> roleManager, UserManager<ApplicationUser> userManager, IOptions<DbInitializerOptions> config)
            : base(db, roleManager, userManager, config)
        { }

        public async override Task SeedAsync(bool createSuperUser)
        {
            _db.Database.Migrate();

            await base.SeedAsync(createSuperUser);
        }
    }
}
