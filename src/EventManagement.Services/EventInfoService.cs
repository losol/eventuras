using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace losol.EventManagement.Services
{
	public class EventInfoService : IEventInfoService
	{
		private readonly ApplicationDbContext _db;

		public EventInfoService(ApplicationDbContext db)
		{
			_db = db;
		}

		public async Task<List<EventInfo>> GetFeaturedEventsAsync() 
		{
			return await _db.EventInfos.Where(i => i.Published && i.Featured)
					  .ToListAsync();
		}

	}
}
