#nullable enable

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Events.Products;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Registrations;

namespace Eventuras.Services.Orders
{
    public class OrderManagementService : IOrderManagementService
    {
        private readonly IOrderAccessControlService _orderAccessControlService;
        private readonly IRegistrationRetrievalService _registrationRetrievalService;
        private readonly IRegistrationAccessControlService _registrationAccessControlService;
        private readonly IProductRetrievalService _productRetrievalService;
        private readonly ApplicationDbContext _context;

        public OrderManagementService(
            IOrderAccessControlService orderAccessControlService,
            IRegistrationRetrievalService registrationRetrievalService,
            IRegistrationAccessControlService registrationAccessControlService,
            IProductRetrievalService productRetrievalService,
            ApplicationDbContext context)
        {
            _orderAccessControlService = orderAccessControlService;
            _context = context;
            _registrationRetrievalService = registrationRetrievalService;
            _registrationAccessControlService = registrationAccessControlService;
            _productRetrievalService = productRetrievalService;
        }

        public async Task CancelOrderAsync(Order order, CancellationToken cancellationToken = default)
        {
            ArgumentNullException.ThrowIfNull(order);

            await _orderAccessControlService.CheckOrderUpdateAccessAsync(order, cancellationToken);

            order.MarkAsCancelled();

            await _context.UpdateAsync(order, cancellationToken);
        }

        public async Task UpdateOrderLinesAsync(
            Order order,
            ICollection<OrderLineModel> updatedOrderLines,
            CancellationToken cancellationToken = default)
        {
            ArgumentNullException.ThrowIfNull(order);
            ArgumentNullException.ThrowIfNull(updatedOrderLines);

            if (!order.CanEdit)
                throw new InvalidOperationServiceException($"Order {order.OrderId} cannot be updated being in {order.Status} status");

            await _orderAccessControlService.CheckOrderUpdateAccessAsync(order, cancellationToken);

            var registration = await _registrationRetrievalService.GetRegistrationByIdAsync(order.RegistrationId,
                new RegistrationRetrievalOptions()
                {
                    LoadEventInfo = true
                },
                cancellationToken);

            // find order lines in order that were not existing in updatedOrderLines and then remove them
            order.OrderLines.RemoveAll(existing => updatedOrderLines.All(
                updated => updated.ProductId != existing.ProductId || updated.ProductVariantId != existing.ProductVariantId));

            foreach (var line in updatedOrderLines)
            {
                var existingOrderLine = order.OrderLines
                    .FirstOrDefault(ol => ol.ProductId == line.ProductId
                                       && ol.ProductVariantId == line.ProductVariantId);

                if (existingOrderLine != null)
                { // if order line existed in the order - update it's quantity
                    ValidateMinimumQuantityForProduct(existingOrderLine.Product, updatedOrderLines);
                    existingOrderLine.Quantity = line.Quantity;
                }
                else
                { // if order line does not exist in the order - find product with variant and create order line for it
                    var orderLine = await CreateOrderLine(registration.EventInfo, line, updatedOrderLines, cancellationToken);
                    order.OrderLines.Add(orderLine);
                }
            }

            await _context.UpdateAsync(order, cancellationToken);
        }

        public async Task<Order> CreateOrderForRegistrationAsync(
            int registrationId,
            ICollection<OrderLineModel>? orderLines = null,
            CancellationToken cancellationToken = default)
        {
            var registration = await GetRegistrationForUpdate(registrationId, cancellationToken);

            orderLines ??= Array.Empty<OrderLineModel>();
            List<OrderLine> orderLinesMapped = new();
            foreach (var ol in orderLines)
            {
                var orderLine = await CreateOrderLine(registration.EventInfo, ol, orderLines, cancellationToken);
                orderLinesMapped.Add(orderLine);
            }

            var order = new Order
            {
                User = registration.User,
                Registration = registration,
                CustomerName = registration.CustomerName ?? registration.ParticipantName,
                CustomerEmail = registration.CustomerEmail ?? registration.CustomerEmail,
                CustomerVatNumber = registration.CustomerVatNumber,
                CustomerInvoiceReference = registration.CustomerInvoiceReference,
                PaymentMethod = registration.PaymentMethod,
                OrderLines = orderLinesMapped,
            };
            order.AddLog();

            await _context.CreateAsync(order, cancellationToken: cancellationToken);
            return order;
        }

        private async Task<Registration> GetRegistrationForUpdate(int registrationId, CancellationToken cancellationToken)
        {
            Registration registration;
            try
            {
                registration = await _registrationRetrievalService.GetRegistrationByIdAsync(registrationId,
                                   new RegistrationRetrievalOptions
                                   {
                                       LoadUser = true,
                                       LoadEventInfo = true,
                                       ForUpdate = true
                                   },
                                   cancellationToken)
                            ?? throw new ArgumentServiceException($"Registration by id {registrationId} was not found", nameof(registrationId));
            }
            catch (NotFoundException e)
            {
                throw new ArgumentServiceException($"Registration with id {registrationId} was not found", nameof(registrationId), e);
            }

            await _registrationAccessControlService.CheckRegistrationUpdateAccessAsync(registration, cancellationToken);
            return registration;
        }

        private async Task<OrderLine> CreateOrderLine(
            EventInfo eventInfo,
            OrderLineModel line,
            IEnumerable<OrderLineModel> allLines,
            CancellationToken cancellationToken)
        {
            if (line.Quantity == 0) throw new ArgumentServiceException($"Quantity should be a non-zero number");

            Product product;
            try
            {
                product = await _productRetrievalService.GetProductByIdAsync(line.ProductId,
                    new ProductRetrievalOptions
                    {
                        LoadVariants = true,
                        LoadEvent = true,
                        ForUpdate = true,
                    },
                    cancellationToken);
            }
            catch (NotFoundException e)
            {
                throw new ArgumentServiceException($"Product with id {line.ProductId} was not found", null, e);
            }

            await ValidateProductVisibility(product, eventInfo);
            ValidateMinimumQuantityForProduct(product, allLines);

            ProductVariant? productVariant = null;
            if (line.ProductVariantId != null)
            {
                productVariant = product.ProductVariants.FirstOrDefault(pv => pv.ProductVariantId == line.ProductVariantId);
                if (productVariant == null)
                    throw new ArgumentServiceException($"Product variant was not found by product id {line.ProductId} "
                                                     + $"and variant id {line.ProductVariantId}");
            }
            else if (product.ProductVariants.Any())
            {
                throw new ArgumentServiceException($"Product with id {line.ProductId} has variants, "
                                                 + $"thus variant id should be specified for this product ");
            }

            var orderLine = new OrderLine(product, line.Quantity, productVariant);
            return orderLine;
        }

        private static void ValidateMinimumQuantityForProduct(Product product, IEnumerable<OrderLineModel> orderLines)
        {
            var productMinQuantity = product.MinimumQuantity;
            var specifiedSumQuantity = orderLines
                .Where(ol => ol.ProductId == product.ProductId)
                .Sum(ol => ol.Quantity);

            if (specifiedSumQuantity < productMinQuantity)
                throw new ArgumentServiceException($"Product with id {product.ProductId} has minimum quantity of {productMinQuantity}, "
                                                 + $"but {specifiedSumQuantity} in total for all product variants was specified");
        }

        private async Task ValidateProductVisibility(Product product, EventInfo orderEventInfo)
        {
            if (product.Visibility == ProductVisibility.Collection)
            {
                await LoadEventCollections(product.EventInfo);
                await LoadEventCollections(orderEventInfo);

                // requires at least one common collection for event infos
                var commonCollections = orderEventInfo.Collections
                    .IntersectBy(product.EventInfo.Collections.Select(c => c.CollectionId), ec => ec.CollectionId);

                if (!commonCollections.Any()) throw new ArgumentServiceException(
                    $"Product with id {product.ProductId} is not visible for event with id {orderEventInfo.EventInfoId}");
            }
            else if (product.EventInfoId != orderEventInfo.EventInfoId)
                throw new ArgumentServiceException(
                    $"Product with id {product.ProductId} is not visible for event with id {orderEventInfo.EventInfoId}");

            return;

            async Task LoadEventCollections(EventInfo ei)
            {
                var collectionsNavigation = _context.Entry(ei).Collection(entity => entity.Collections);
                if (!collectionsNavigation.IsLoaded) await collectionsNavigation.LoadAsync();
            }
        }
    }
}