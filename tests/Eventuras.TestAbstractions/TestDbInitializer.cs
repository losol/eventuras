using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.DbInitializers;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace Eventuras.TestAbstractions
{
    public class TestDbInitializer : BaseDbInitializer
    {
        private static readonly SemaphoreSlim SemaphoreSlim = new SemaphoreSlim(1, 1);

        public TestDbInitializer(
            ApplicationDbContext db,
            RoleManager<IdentityRole> roleManager,
            UserManager<ApplicationUser> userManager,
            IOptions<DbInitializerOptions> config)
            : base(db, roleManager, userManager, config)
        { }

        public override async Task SeedAsync(bool createSuperUser)
        {
            await SemaphoreSlim.WaitAsync();
            try
            {
                if (await _db.Database.EnsureCreatedAsync())
                {
                    await base.SeedAsync(createSuperUser);
                    await _db.EventInfos.AddRangeAsync(SeedData.Events);
                    await _db.SaveChangesAsync();
                }
            }
            finally
            {
                SemaphoreSlim.Release();
            }
        }
    }
}
