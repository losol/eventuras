using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services
{
    public interface IEventInfoService
    {
        Task<EventInfo> GetAsync(int id);
        Task<EventInfo> GetWithOrganizerAsync(int id);
        Task<EventInfo> GetWithProductsAsync(int id);
        Task<int> GetRegistrationCount(int eventId);

        Task<List<EventInfo>> GetFeaturedEventsAsync();
        Task<List<EventInfo>> GetEventsAsync();
        Task<List<EventInfo>> GetUnpublishedEventsAsync();
        Task<List<EventInfo>> GetPastEventsAsync();
        Task<List<EventInfo>> GetOnDemandEventsAsync();
        Task<List<EventInfo>> GetOngoingEventsAsync();

        Task<bool> AddAsync(EventInfo info);
        Task<bool> UpdateEventWithProductsAsync(EventInfo info);
        Task<bool> UpdateEventProductsAsync(int eventId, List<Product> products);

    }
}
