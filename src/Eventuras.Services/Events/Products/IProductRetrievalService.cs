using Eventuras.Domain;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.Events.Products
{
    public interface IProductRetrievalService
    {
        Task<ICollection<Product>> ListProductsAsync(
            ProductListRequest request,
            ProductRetrievalOptions options = null,
            CancellationToken cancellationToken = default);

        Task<Product> GetProductByIdAsync(int productId,
            ProductRetrievalOptions options = null,
            CancellationToken cancellationToken = default);
    }
}
