using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Services
{
	public interface IEventInfoService
	{
		Task<EventInfo> GetAsync(int id);
		Task<List<EventInfo>> GetFeaturedEventsAsync();
		Task<List<EventInfo>> GetUpcomingEventsAsync();
	}
}
