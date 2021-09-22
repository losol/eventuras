using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Registrations;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Orders
{
    public class OrderManagementService : IOrderManagementService
    {
        private readonly IOrderAccessControlService _orderAccessControlService;
        private readonly IRegistrationRetrievalService _registrationRetrievalService;
        private readonly ApplicationDbContext _context;

        public OrderManagementService(
            IOrderAccessControlService orderAccessControlService,
            IRegistrationRetrievalService registrationRetrievalService,
            ApplicationDbContext context)
        {
            _orderAccessControlService = orderAccessControlService ?? throw
                new ArgumentNullException(nameof(orderAccessControlService));

            _context = context ?? throw
                new ArgumentNullException(nameof(context));
            _registrationRetrievalService = registrationRetrievalService;
        }

        public async Task CancelOrderAsync(Order order, CancellationToken cancellationToken)
        {
            if (order == null)
            {
                throw new ArgumentNullException(nameof(order));
            }

            await _orderAccessControlService.CheckOrderUpdateAccessAsync(order, cancellationToken);

            order.MarkAsCancelled();

            await _context.UpdateAsync(order, cancellationToken);
        }

        public async Task UpdateOrderAsync(Order order, OrderUpdates updates, CancellationToken cancellationToken)
        {
            if (order == null)
            {
                throw new ArgumentNullException(nameof(order));
            }

            if (updates == null)
            {
                throw new ArgumentNullException(nameof(updates));
            }

            if (!order.CanEdit)
            {
                throw new OrderUpdateException(
                    $"Order {order.OrderId} cannot be updated being in {order.Status} status");
            }

            await _orderAccessControlService.CheckOrderUpdateAccessAsync(order, cancellationToken);

            var registration = await _registrationRetrievalService
                .GetRegistrationByIdAsync(order.RegistrationId,
                    new RegistrationRetrievalOptions
                    {
                        LoadOrders = true,
                        LoadProducts = true
                    }, cancellationToken);

            var productMap = await _context.Products
                .Where(p => updates.GetProductIds().Contains(p.ProductId))
                .ToDictionaryAsync(p => p.ProductId, cancellationToken);

            var variantIds = updates.GetProductIds()
                .Where(updates.HasVariant)
                .Select(updates.GetProductVariantId)
                .ToArray();

            var variantMap = variantIds.Any()
                ? await _context.ProductVariants
                    .Where(v => variantIds.Contains(v.ProductVariantId))
                    .ToDictionaryAsync(v => v.ProductVariantId,
                        cancellationToken)
                : new Dictionary<int, ProductVariant>();

            var firstProductWithInvalidQuantity = updates
                .GetProductIds()
                .Select(productId => productId as int?)
                .FirstOrDefault(productId =>
                    productMap[productId.Value].MinimumQuantity > updates.GetQuantity(productId.Value));

            if (firstProductWithInvalidQuantity != null)
            {
                var product = productMap[firstProductWithInvalidQuantity.Value];
                var quantity = updates.GetQuantity(firstProductWithInvalidQuantity.Value);
                throw new OrderUpdateException(
                    $"Product {product.Name}'s min quantity is {product.MinimumQuantity} but {quantity} was given");
            }

            // FIXME: update using old create-or-update logic
            // TODO: rewrite logic 

            registration.UpdateOrder(order, updates.GetProductIds()
                .Select(productId =>
                    new OrderDTO
                    {
                        Product = productMap[productId],
                        Variant = updates.HasVariant(productId)
                            ? variantMap[updates.GetProductVariantId(productId)]
                            : null,
                        Quantity = updates.GetQuantity(productId)
                    }));

            await _context.UpdateAsync(order, cancellationToken);
        }
    }
}
