using System.Collections.Generic;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services;

public interface IProductsService
{
    Task<List<Product>> GetAsync();
    Task<Product> GetAsync(int id);

    Task<List<Product>> GetProductsForEventAsync(int eventId);
    Task<List<Registration>> GetRegistrationsForProductAsync(int productId);
    Task<List<Registration>> GetRegistrationsForProductVariantAsync(int productVariantId);

    Task<bool> UpdateProductAsync(int productId, bool published);
    Task<bool> UpdateProductVariantAsync(int productVariantId, bool published);
}
