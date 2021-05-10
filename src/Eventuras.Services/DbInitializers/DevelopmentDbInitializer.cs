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

            // Seed test events if no events exist.
            if (!_db.EventInfos.Any())
            {
                var eventInfos = new EventInfo[]
                {
                    new EventInfo{Title="Test event 01", Slug="Test01", Description="A test event."},
                    new EventInfo{Title="Test event 02", Slug="Test02", Description="Another test event."}
                };

                foreach (var item in eventInfos)
                {
                    await _db.EventInfos.AddAsync(item);
                }

                await _db.SaveChangesAsync();
            }

            await base.SeedAsync(createSuperUser);
        }
    }
}
