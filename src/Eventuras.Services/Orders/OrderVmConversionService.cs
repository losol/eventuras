using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Orders
{
    internal class OrderVmConversionService : IOrderVmConversionService
    {
        private readonly ApplicationDbContext context;

        public OrderVmConversionService(ApplicationDbContext context)
        {
            this.context = context;
        }

        public async Task<IEnumerable<OrderDTO>> OrderVmsToOrderDtos(ICollection<OrderVM> orders)
        {
            var productIds = orders.Select(o => o.ProductId).ToArray();
            var variantIds = orders.Select(o => o.VariantId).ToArray();

            var productMap = await this.context.Products
                .Where(p => productIds.Contains(p.ProductId))
                .ToDictionaryAsync(p => p.ProductId);

            var variantMap = await this.context.ProductVariants
                .Where(v => variantIds.Contains(v.ProductVariantId))
                .ToDictionaryAsync(v => v.ProductVariantId);

            return orders.Select(o => new OrderDTO
            {
                Product = productMap[o.ProductId],
                Variant = o.VariantId.HasValue ? variantMap[o.VariantId.Value] : null,
                Quantity = o.Quantity
            });
        }
    }
}
