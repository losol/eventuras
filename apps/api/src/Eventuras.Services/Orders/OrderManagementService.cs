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
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.Orders;

public class OrderManagementService : IOrderManagementService
{
    private readonly IOrderAccessControlService _orderAccessControlService;
    private readonly IRegistrationRetrievalService _registrationRetrievalService;
    private readonly IRegistrationAccessControlService _registrationAccessControlService;
    private readonly IProductRetrievalService _productRetrievalService;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<OrderManagementService> _logger;

    public OrderManagementService(
        IOrderAccessControlService orderAccessControlService,
        IRegistrationRetrievalService registrationRetrievalService,
        IRegistrationAccessControlService registrationAccessControlService,
        IProductRetrievalService productRetrievalService,
        ApplicationDbContext context,
        ILogger<OrderManagementService> logger)
    {
        _orderAccessControlService = orderAccessControlService;
        _context = context;
        _registrationRetrievalService = registrationRetrievalService;
        _registrationAccessControlService = registrationAccessControlService;
        _productRetrievalService = productRetrievalService;
        _logger = logger;
    }

    public async Task<Order> UpdateOrderAsync(
        Order order,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(order);

        if (!order.CanEdit)
        {
            _logger.LogError("Order {OrderId} cannot be updated being in {OrderStatus} status", order.OrderId, order.Status);
            throw new InvalidOperationServiceException($"Order {order.OrderId} cannot be updated being in {order.Status} status");
        }

        await _orderAccessControlService.CheckOrderUpdateAccessAsync(order, cancellationToken);

        _context.Update(order);
        await _context.SaveChangesAsync(cancellationToken);

        return order;
    }

    public async Task CancelOrderAsync(Order order, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(order);

        await _orderAccessControlService.CheckOrderUpdateAccessAsync(order, cancellationToken);

        order.SetStatus(Order.OrderStatus.Cancelled);

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
                LoadEventInfo = true,
                ForUpdate = true,
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
                existingOrderLine.Quantity = line.Quantity;
            }
            else
            { // if order line does not exist in the order - find product with variant and create order line for it
                var orderLine = await CreateOrderLine(registration.EventInfo, line, cancellationToken);
                order.OrderLines.Add(orderLine);
            }
        }

        _context.Update(order);

        var isAdmin = await _orderAccessControlService.HasAdminAccessAsync(order, cancellationToken);
        _logger.LogInformation("User is admin: {isAdmin}", isAdmin);

        // validate minimum quantity for products if it is not an admin user
        if (!isAdmin)
            await ValidateMinimumQuantityForProducts(registration, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<Order> CreateOrderForRegistrationAsync(
 int registrationId,
 ICollection<OrderLineModel>? orderLines = null,
 CancellationToken cancellationToken = default)
    {
        _logger.LogInformation($"Starting order creation for RegistrationId {registrationId}");

        var registration = await GetRegistrationForUpdate(registrationId, cancellationToken);
        _logger.LogInformation($"Retrieved registration for update: RegistrationId {registrationId}");

        orderLines ??= Array.Empty<OrderLineModel>();
        List<OrderLine> orderLinesMapped = new();

        foreach (var line in orderLines)
        {
            var orderLine = await CreateOrderLine(registration.EventInfo, line, cancellationToken);
            orderLinesMapped.Add(orderLine);
        }
        _logger.LogInformation($"Mapped {orderLinesMapped.Count} order lines for RegistrationId {registrationId}");

        var order = new Order
        {
            User = registration.User,
            Registration = registration,
            CustomerName = registration.CustomerName ?? registration.User.Name,
            CustomerEmail = registration.CustomerEmail ?? registration.CustomerEmail,
            CustomerVatNumber = registration.CustomerVatNumber,
            CustomerInvoiceReference = registration.CustomerInvoiceReference,
            PaymentMethod = registration.PaymentMethod,
            OrderLines = orderLinesMapped,
        };
        order.AddLog();
        _logger.LogInformation($"Created new order object for RegistrationId {registrationId}");

        await _context.AddAsync(order, cancellationToken);
        _logger.LogInformation($"Added new order to context for RegistrationId {registrationId}");

        await ValidateMinimumQuantityForProducts(registration, cancellationToken);
        _logger.LogInformation($"Validated minimum quantity for products for RegistrationId {registrationId}");

        await _context.SaveChangesAsync(cancellationToken);
        _logger.LogInformation($"Saved changes to context for RegistrationId {registrationId}");

        return order;
    }


    public async Task<Order?> AutoCreateOrUpdateOrder(
   int registrationId,
   IEnumerable<OrderLineModel> expectedOrderLines,
   CancellationToken cancellationToken = default)
    {
        _logger.LogInformation($"OrderManagementService.AutoCreateOrUpdateOrder: RegistrationId {registrationId}");

        var expectedOrderLinesSanitized = SanitizeOrderLines(expectedOrderLines);
        _logger.LogDebug("Sanitized expected order lines.");

        // Get order lines in registration
        var registration = await GetRegistrationForUpdate(registrationId, cancellationToken);
        _logger.LogInformation($"AutoCreateOrUpdateOrder: Retrieved registration for update: RegistrationId {registrationId}");

        var registrationOrderLines = registration.Orders
            .SelectMany(o => o.OrderLines)
            .Select(OrderLineModel.FromOrderLineDomainModel);
        var registrationOrderLinesSanitized = SanitizeOrderLines(registrationOrderLines);
        _logger.LogDebug("Sanitized existing registration order lines.");

        // Get order lines diff with registration lines, if there are no diff - exit early
        var diff = GetDifferenceInOrderLines(expectedOrderLinesSanitized, registrationOrderLinesSanitized);
        if (diff.Count == 0)
        {
            _logger.LogInformation("AutoCreateOrUpdateOrder: No difference in order lines found. Exiting early.");
            return null;
        }
        _logger.LogDebug($"AutoCreateOrUpdateOrder: Found differences in order lines: {diff.Count} differences");

        // Find newest order viable to be updated
        var order = registration.Orders.Where(o => o.CanEdit).MaxBy(o => o.OrderTime);
        if (order != null)
        {
            _logger.LogInformation("AutoCreateOrUpdateOrder: Found existing order viable for updating.");

            var existingOrderLines = order.OrderLines.Select(OrderLineModel.FromOrderLineDomainModel);
            var combinedDiffAndOrder = SanitizeOrderLines(diff.Concat(existingOrderLines));

            _logger.LogInformation($"AutoCreateOrUpdateOrder: Sanitized combined diff and order lines. {combinedDiffAndOrder.ToArray()}");
            await UpdateOrderLinesAsync(order, combinedDiffAndOrder.ToArray(), cancellationToken);

            _logger.LogInformation("Updated existing order lines.");
            return order;
        }

        // if no order found for update - create a new order
        _logger.LogInformation("AutoCreateOrUpdateOrder: No existing order viable for update. Creating a new order.");
        order = await CreateOrderForRegistrationAsync(registrationId, diff, cancellationToken);
        return order;

        static ICollection<OrderLineModel> GetDifferenceInOrderLines(
            ICollection<OrderLineModel> expected,
            ICollection<OrderLineModel> actual)
        {
            var toAdd = expected
                .ExceptBy(actual.Select(ol => new { ol.ProductId, ol.ProductVariantId }), ol => new { ol.ProductId, ol.ProductVariantId });

            var toRemove = actual
                .ExceptBy(expected.Select(ol => new { ol.ProductId, ol.ProductVariantId }), ol => new { ol.ProductId, ol.ProductVariantId })
                .Select(ol => ol.CopyWithInvertedQuantity());

            var toUpdate = GetUpdates(expected, actual);

            return toAdd
                .Union(toRemove)
                .Union(toUpdate)
                .Where(ol => ol.Quantity != 0)
                .ToArray();

            static IEnumerable<OrderLineModel> GetUpdates(
                ICollection<OrderLineModel> expected,
                IEnumerable<OrderLineModel> actual)
            {
                var intersect = actual.IntersectBy(
                    expected.Select(ol => new { ol.ProductId, ol.ProductVariantId }), ol => new { ol.ProductId, ol.ProductVariantId });

                foreach (var act in intersect)
                {
                    var exp = expected.FirstOrDefault(ol => ol.ProductId == act.ProductId && ol.ProductVariantId == act.ProductVariantId);
                    if (exp == null)
                        continue;

                    yield return act with { Quantity = exp.Quantity - act.Quantity };
                }
            }
        }
    }

    private static ICollection<OrderLineModel> SanitizeOrderLines(IEnumerable<OrderLineModel> orderLineModels)
    {
        var sanitized = orderLineModels

            // combine duplications of same products in order lines into single order line
            .GroupBy(ol => new { ol.ProductId, ol.ProductVariantId })
            .Select(group => new OrderLineModel(group.Key.ProductId, group.Key.ProductVariantId, group.Sum(ol => ol.Quantity)))

            // remove order lines with zero quantity
            .Where(ol => ol.Quantity != 0);

        return sanitized.ToArray();
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
                                   ForUpdate = true,
                                   LoadOrders = true
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
        CancellationToken cancellationToken)
    {
        if (line.Quantity == 0)
            throw new ArgumentServiceException($"Quantity should be a non-zero number");

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

        await ValidateProductVisibility(product, eventInfo, cancellationToken);

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

    private async Task ValidateMinimumQuantityForProducts(Registration registration, CancellationToken cancellationToken = default)
    {
        var eventInfo = registration.EventInfo;

        await LoadProductsInEventInfoWithMinimumAmount(eventInfo);
        await LoadOrdersInRegistration();
        foreach (var order in registration.Orders)
            await LoadLinesInOrder(order);

        var mandatoryProducts = eventInfo.Products.Where(p => p.MinimumQuantity > 0);

        var registrationOrderLines = SanitizeOrderLines(registration.Orders
            .SelectMany(o => o.OrderLines)
            .Select(OrderLineModel.FromOrderLineDomainModel));
        var orderedProductsWithAllVariants = registrationOrderLines
            .GroupBy(ol => ol.ProductId)
            .ToDictionary(group => group.Key, group => group.Sum(ol => ol.Quantity));

        foreach (var mandatoryProduct in mandatoryProducts)
        {
            orderedProductsWithAllVariants.TryGetValue(mandatoryProduct.ProductId, out var orderedSum);
            if (orderedSum < mandatoryProduct.MinimumQuantity)
            {
                _logger.LogWarning($"Product with id {mandatoryProduct.ProductId} has minimum quantity {mandatoryProduct.MinimumQuantity}, but current registration has ordered only {orderedSum}");
                throw new ArgumentServiceException($"Product with id {mandatoryProduct.ProductId} has minimum quantity "
                                                 + $"{mandatoryProduct.MinimumQuantity}, but current registration has ordered only {orderedSum}");
            }
        }

        var orderedProductWithNegativeAmount = registrationOrderLines.FirstOrDefault(ol => ol.Quantity < 0);
        if (orderedProductWithNegativeAmount != null)
            throw new ArgumentServiceException($"Product with id {orderedProductWithNegativeAmount.ProductId} was ordered a negative amount "
                                             + $"({orderedProductWithNegativeAmount.Quantity}) in total for current registration.");

        return;

        async Task LoadOrdersInRegistration()
        {
            var collectionNavigation = _context.Entry(registration).Collection(entity => entity.Orders);
            if (!collectionNavigation.IsLoaded)
                await collectionNavigation.LoadAsync(cancellationToken);
        }

        async Task LoadProductsInEventInfoWithMinimumAmount(EventInfo ei)
        {
            var collectionNavigation = _context.Entry(ei).Collection(entity => entity.Products);
            if (!collectionNavigation.IsLoaded)
            {
                var query = collectionNavigation.Query()
                    .Where(p => p.MinimumQuantity > 0);
                await query.LoadAsync(cancellationToken);
            }
        }

        async Task LoadLinesInOrder(Order order)
        {
            var collectionNavigation = _context.Entry(order).Collection(entity => entity.OrderLines);
            if (!collectionNavigation.IsLoaded)
                await collectionNavigation.LoadAsync(cancellationToken);
        }
    }

    private async Task ValidateProductVisibility(Product product, EventInfo orderEventInfo, CancellationToken cancellationToken = default)
    {
        if (product.Visibility == ProductVisibility.Collection)
        {
            await LoadEventCollections(product.EventInfo);
            await LoadEventCollections(orderEventInfo);

            // requires at least one common collection for event infos
            var commonCollections = orderEventInfo.Collections
                .IntersectBy(product.EventInfo.Collections.Select(c => c.CollectionId), ec => ec.CollectionId);

            if (!commonCollections.Any())
                throw new ArgumentServiceException(
                    $"Product with id {product.ProductId} is not visible for event with id {orderEventInfo.EventInfoId}");
        }
        else if (product.EventInfoId != orderEventInfo.EventInfoId)
            throw new ArgumentServiceException(
                $"Product with id {product.ProductId} is not visible for event with id {orderEventInfo.EventInfoId}");

        return;

        async Task LoadEventCollections(EventInfo ei)
        {
            var collectionsNavigation = _context.Entry(ei).Collection(entity => entity.Collections);
            if (!collectionsNavigation.IsLoaded)
                await collectionsNavigation.LoadAsync(cancellationToken);
        }
    }
}
