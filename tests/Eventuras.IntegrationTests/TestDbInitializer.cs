using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.DbInitializers;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using System.Threading;
using System.Threading.Tasks;


namespace Eventuras.IntegrationTests
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

        public override async Task SeedAsync()
        {
            await SemaphoreSlim.WaitAsync();
            try
            {
                if (this._db.Database.EnsureCreated())
                {
                    await base.SeedAsync();
                    this._db.EventInfos.AddRange(SeedData.Events);
                    await this._db.SaveChangesAsync();
                }
            }
            finally
            {
                SemaphoreSlim.Release();
            }
        }
    }
}
