using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Orders;

[Obsolete]
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

        CheckProductIds(orders, productMap);
        CheckMinQuantity(orders, productMap);
        CheckVariantIds(orders, variantMap);

        return orders.Select(o => new OrderDTO
        {
            Product = productMap[o.ProductId],
            Variant = o.VariantId.HasValue ? variantMap[o.VariantId.Value] : null,
            Quantity = o.Quantity
        });
    }

    private static void CheckMinQuantity(IEnumerable<OrderVM> orders, IReadOnlyDictionary<int, Product> productMap)
    {
        var o = orders.FirstOrDefault(o => productMap[o.ProductId].MinimumQuantity > 0 &&
                                           o.Quantity < productMap[o.ProductId].MinimumQuantity);
        if (o != null)
        {
            var product = productMap[o.ProductId];
            throw new ArgumentServiceException($"Product {product.Name}'s min quantity is {product.MinimumQuantity} but {o.Quantity} was given",
                nameof(o.Quantity));
        }
    }

    private static void CheckProductIds(IEnumerable<OrderVM> orders, IReadOnlyDictionary<int, Product> productMap)
    {
        var o = orders.FirstOrDefault(o => !productMap.ContainsKey(o.ProductId));
        if (o != null)
        {
            throw new NotFoundException($"Product #{o.ProductId} not found");
        }
    }

    private static void CheckVariantIds(IEnumerable<OrderVM> orders,
        IReadOnlyDictionary<int, ProductVariant> variantMap)
    {
        var o = orders
            .FirstOrDefault(o => o.VariantId.HasValue &&
                                 !variantMap.ContainsKey(o.VariantId.Value));
        if (o != null)
        {
            throw new NotFoundException($"Product variant #{o.VariantId} not found");
        }
    }
}
