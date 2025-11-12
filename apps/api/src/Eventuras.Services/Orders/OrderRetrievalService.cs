using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Events.Products;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Organizations;
using Eventuras.Services.Registrations;
using Eventuras.Services.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using static Eventuras.Domain.Registration;

namespace Eventuras.Services.Orders;

public class OrderRetrievalService : IOrderRetrievalService
{
    private readonly ApplicationDbContext _context;

    private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;

    // logger
    private readonly ILogger<OrderRetrievalService> _logger;
    private readonly IOrderAccessControlService _orderAccessControlService;
    private readonly IOrganizationAccessControlService _organizationAccessControlService;
    private readonly IProductRetrievalService _productRetrievalService;
    private readonly IRegistrationRetrievalService _registrationRetrievalService;

    public OrderRetrievalService(
        ApplicationDbContext context,
        IOrderAccessControlService orderAccessControlService,
        IOrganizationAccessControlService organizationAccessControlService,
        IProductRetrievalService productRetrievalService,
        IRegistrationRetrievalService registrationRetrievalService,
        ICurrentOrganizationAccessorService currentOrganizationAccessorService,
        ILogger<OrderRetrievalService> logger)
    {
        _context = context ?? throw
            new ArgumentNullException(nameof(context));

        _orderAccessControlService = orderAccessControlService ?? throw
            new ArgumentNullException(nameof(orderAccessControlService));

        _organizationAccessControlService = organizationAccessControlService ?? throw
            new ArgumentNullException(nameof(organizationAccessControlService));

        _productRetrievalService = productRetrievalService ?? throw
            new ArgumentNullException(nameof(productRetrievalService));

        _registrationRetrievalService = registrationRetrievalService ?? throw
            new ArgumentException(nameof(registrationRetrievalService));

        _currentOrganizationAccessorService = currentOrganizationAccessorService ?? throw
            new ArgumentNullException(nameof(currentOrganizationAccessorService));

        _logger = logger ?? throw
            new ArgumentNullException(nameof(logger));
    }

    public async Task<Order> GetOrderByIdAsync(int id,
        OrderRetrievalOptions options = null,
        CancellationToken cancellationToken = default)
    {
        var order = await _context.Orders
            .WithOptions(options ?? new OrderRetrievalOptions())
            .FirstOrDefaultAsync(o => o.OrderId == id, cancellationToken) ?? throw
            new NotFoundException($"Order {id} not found");

        await _orderAccessControlService.CheckOrderReadAccessAsync(order, cancellationToken);

        // log the complete order
        _logger.LogInformation("Order retrieved: {@Order}", order);

        return order;
    }

    public async Task<Paging<Order>> ListOrdersAsync(
        OrderListRequest request,
        OrderRetrievalOptions options = default,
        CancellationToken cancellationToken = default)
    {
        var filter = request.Filter ?? new OrderListFilter();

        var query = _context.Orders
            .AsNoTracking()
            .WithOptions(options ?? new OrderRetrievalOptions())
            .WithOrder(request.Order, request.Descending)
            .WithFilter(filter);

        if (filter.AccessibleOnly)
        {
            query = await _orderAccessControlService
                .AddAccessFilterAsync(query, cancellationToken);
        }

        return await Paging.CreateAsync(query, request, cancellationToken);
    }

    public async Task<ProductDeliverySummaryDto> GetProductDeliverySummaryAsync(int productId,
        CancellationToken cancellationToken = default)
    {
        // Validate the product
        var product = await _productRetrievalService.GetProductByIdAsync(productId);
        if (product == null)
        {
            throw new NotFoundException($"Product with ID {productId} not found.");
        }

        // Validate organization
        var organization = await _currentOrganizationAccessorService.GetCurrentOrganizationAsync();
        if (organization == null)
        {
            throw new NotFoundException("No valid organization context found.");
        }

        await _organizationAccessControlService.CheckOrganizationReadAccessAsync(organization.OrganizationId);

        // Step 1: Load necessary OrderLine data
        var orderLines = await _context.OrderLines
            .Include(ol => ol.Order)
            .ThenInclude(o => o.Registration)
            .ThenInclude(r => r.User)
            .Where(ol => ol.ProductId == productId)
            .ToListAsync(cancellationToken);

        // Step 2: Group by RegistrationId and calculate SumQuantity
        var groupedRegistrations = orderLines
            .GroupBy(ol => new
            {
                ol.Order.Registration.RegistrationId,
                RegistrationStatus = ol.Order.Registration.Status,
                ol.Order.Registration.User
            })
            .Select(group => new ProductOrdersSummaryDto
            {
                RegistrationId = group.Key.RegistrationId,
                RegistrationStatus = group.Key.RegistrationStatus,
                User = new UserSummaryDto
                {
                    UserId = group.Key.User.Id,
                    Name = group.Key.User.Name,
                    PhoneNumber = group.Key.User.PhoneNumber,
                    Email = group.Key.User.Email
                },
                OrderIds = group.Select(ol => ol.Order.OrderId).Distinct().ToArray(),
                SumQuantity = group.Sum(ol => ol.Quantity)
            })
            .Where(summary => summary.SumQuantity > 0) // Filter out registrations with net zero quantity
            .ToList();

        // Step 3: Calculate statistics by registration status
        var byStatus = groupedRegistrations
            .GroupBy(r => r.RegistrationStatus)
            .ToDictionary(
                g => g.Key,
                g => g.Count()
            );

        // Return the final summary
        return new ProductDeliverySummaryDto
        {
            Product = ProductSummaryDto.FromProduct(product),
            OrderSummary = groupedRegistrations,
            Statistics = new ProductStatisticsDto
            {
                ByRegistrationStatus = new ByRegistrationStatus
                {
                    Draft = byStatus.GetValueOrDefault(RegistrationStatus.Draft, 0),
                    Cancelled = byStatus.GetValueOrDefault(RegistrationStatus.Cancelled, 0),
                    Verified = byStatus.GetValueOrDefault(RegistrationStatus.Verified, 0),
                    NotAttended = byStatus.GetValueOrDefault(RegistrationStatus.NotAttended, 0),
                    Attended = byStatus.GetValueOrDefault(RegistrationStatus.Attended, 0),
                    Finished = byStatus.GetValueOrDefault(RegistrationStatus.Finished, 0),
                    WaitingList = byStatus.GetValueOrDefault(RegistrationStatus.WaitingList, 0)
                }
            }
        };
    }

    public async Task<List<Order>> GetOrdersPopulatedByRegistrationAsync(IEnumerable<int> orderIds,
        CancellationToken cancellationToken)
    {
        var orders = new List<Order>();

        foreach (var orderId in orderIds)
        {
            var order = await GetOrderByIdAsync(orderId,
                new OrderRetrievalOptions
                {
                    IncludeRegistration = true, IncludeUser = true, IncludeOrderLines = true, IncludeEvent = true
                }, cancellationToken);

            _logger.LogDebug("GetOrdersPopulatedByRegistrationAsync - Order: {@Registration}", order);

            if (order != null)
            {
                await PopulateOrderFieldsAsync(order, cancellationToken);
                orders.Add(order);
            }
        }

        return orders;
    }

    private async Task PopulateOrderFieldsAsync(Order order, CancellationToken cancellationToken)
    {
        var registration =
            await _registrationRetrievalService.GetRegistrationByIdAsync(order.RegistrationId, null, cancellationToken);
        if (registration != null)
        {
            _logger.LogDebug("PopulateOrderFieldsAsync - Registration: {@Registration}", registration);

            order.CustomerName = ValidationHelper.GetValueIfEmpty(order.CustomerName, registration.User?.Name);
            order.CustomerEmail = ValidationHelper.GetValueIfEmpty(order.CustomerEmail, registration.User?.Email);
            order.CustomerVatNumber =
                ValidationHelper.GetValueIfEmpty(order.CustomerVatNumber, registration.CustomerVatNumber);
            order.CustomerInvoiceReference = ValidationHelper.GetValueIfEmpty(order.CustomerInvoiceReference,
                registration.CustomerInvoiceReference);
            order.PaymentMethod = ValidationHelper.GetValueIfDefault(order.PaymentMethod, registration.PaymentMethod);
            order.Log = ValidationHelper.GetValueIfEmpty(order.Log, registration.Log);
        }
        else
        {
            _logger.LogWarning("PopulateOrderFieldsAsync - Registration not found for OrderId: {OrderId}",
                order.OrderId);
        }
    }
}
