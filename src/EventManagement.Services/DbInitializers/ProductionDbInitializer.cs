using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using System.Linq;

namespace losol.EventManagement.Services.DbInitializers
{
	public class ProductionDbInitializer : BaseDbInitializer, IDbInitializer
	{
		public ProductionDbInitializer(ApplicationDbContext db, RoleManager<IdentityRole> roleManager, UserManager<ApplicationUser> userManager, IOptions<DbInitializerOptions> config)
			: base(db, roleManager, userManager, config)
		{ }

		public override async Task SeedAsync()
		{
			_db.Database.Migrate(); // FIXME: Do not do this in production!
			await base.SeedAsync();

			// Seed test events if no events exist. 
			// TODO: Check if this is really needed.
			if (!_db.EventInfos.Any())
			{
				var eventInfos = new EventInfo[]
				{
					new EventInfo{Title="Test event 01", Code="Test01", Description="A test event."},
					new EventInfo{Title="Test event 02", Code="Test02", Description="Another test event."}
				};

				await _db.EventInfos.AddRangeAsync(eventInfos);
				await _db.SaveChangesAsync();
			}
		}
	}
}
