using System.Collections.Generic;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Events
{
    public interface IEventProductsManagementService
    {
        Task UpdateEventProductsAsync(int eventId, List<Product> products);
    }
}
