using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using losol.EventManagement.Services.DbInitializers;


namespace losol.EventManagement.IntegrationTests
{
	public class TestDbInitializer : IDbInitializer
	{

		private readonly ApplicationDbContext _db;

		public TestDbInitializer(ApplicationDbContext db)
		{
			_db = db;
		}

		public Task SeedAsync()
		{
			_db.Database.EnsureCreated();
			_db.EventInfos.AddRange(SeedData.Events);
			_db.SaveChanges();
			return Task.CompletedTask;
		}
	}
}
