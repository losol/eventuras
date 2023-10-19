using Eventuras.Domain;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Eventuras.Services
{
    public interface IProductsService
    {
        Task<List<Product>> GetAsync();
        Task<Product> GetAsync(int id);

        Task<List<Product>> GetProductsForEventAsync(int eventId);
        Task<List<Registration>> GetRegistrationsForProductAsync(int productId);
        Task<List<Registration>> GetRegistrationsForProductVariantAsync(int productId);

        Task<bool> UpdateProductAsync(int productId, bool published);
        Task<bool> UpdateProductVariantAsync(int productVariantId, bool published);
    }
}