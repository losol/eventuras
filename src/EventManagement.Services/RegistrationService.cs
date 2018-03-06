using System;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace losol.EventManagement.Services
{
	public class RegistrationService : IRegistrationService
	{
		private readonly ApplicationDbContext _db;

		public RegistrationService(ApplicationDbContext db)
		{
			_db = db;
		}

		public async Task<Registration> GetAsync(int id)
		{
			return await _db.Registrations
				            .FindAsync(id);
		}

		public async Task<Registration> GetWithEventInfoAsync(int id)
		{
			return await _db.Registrations
				            .Where(x => x.RegistrationId == id)
							.Include(r => r.EventInfo)
			       		    .SingleOrDefaultAsync();
		}

		public async Task<int> SetRegistrationAsVerified(int id)
		{
			var registration = await GetAsync(id);
			registration.Verify();
			return await _db.SaveChangesAsync();
		}
	}
}
