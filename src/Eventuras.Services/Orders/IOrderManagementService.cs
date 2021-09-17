using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Orders
{
    public interface IOrderManagementService
    {
        Task CancelOrderAsync(Order order, CancellationToken cancellationToken = default);

        /// <summary>
        /// Update order with new products/quantities.
        /// </summary>
        /// <param name="order">Not <c>null</c>.</param>
        /// <param name="updates">Set of updates. Not <c>null</c>.</param>
        /// <param name="cancellationToken"></param>
        /// <exception cref="OrderUpdateException">Invoiced or cancelled orders cannot be updated.</exception>
        Task UpdateOrderAsync(Order order, OrderUpdates updates, CancellationToken cancellationToken = default);
    }

    public interface IOrderUpdatesBuilder
    {
        IOrderProductUpdateBuilder AddProduct(int productId, int quantity);
    }

    public interface IOrderProductUpdateBuilder : IOrderUpdatesBuilder
    {
        IOrderProductUpdateBuilder WithVariant(int productVariantId);
    }

    public class OrderUpdates : IOrderUpdatesBuilder, IOrderProductUpdateBuilder
    {
        private readonly IDictionary<int, int> _quantities = new Dictionary<int, int>();
        private readonly IDictionary<int, int> _variants = new Dictionary<int, int>();
        private int? _currentProductId;

        public IOrderProductUpdateBuilder AddProduct(int productId, int quantity)
        {
            if (quantity < 0)
            {
                throw new ArgumentException(nameof(quantity));
            }

            _quantities.Add(productId, quantity);
            _currentProductId = productId;
            return this;
        }

        public IOrderProductUpdateBuilder WithVariant(int productVariantId)
        {
            if (!_currentProductId.HasValue)
            {
                throw new InvalidOperationException(
                    "IOrderProductUpdateBuilder.WithVariant called before AddProduct? impossible!");
            }

            _variants.Add(_currentProductId.Value, productVariantId);
            return this;
        }

        public ICollection<int> GetProductIds()
        {
            return _quantities.Keys;
        }

        public int GetQuantity(int productId)
        {
            if (!_quantities.ContainsKey(productId))
            {
                throw new ArgumentException($"No product id found: {productId}");
            }

            return _quantities[productId];
        }

        public int GetProductVariantId(int productId)
        {
            if (!_variants.ContainsKey(productId))
            {
                throw new ArgumentException($"No variant exist for product id {productId}");
            }

            return _variants[productId];
        }

        public bool HasVariant(int productId)
        {
            return _variants.ContainsKey(productId);
        }
    }
}
