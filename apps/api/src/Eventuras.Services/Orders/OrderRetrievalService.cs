using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Servcies.Registrations;
using Eventuras.Services.Events;
using Eventuras.Services.Events.Products;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Organizations;
using Eventuras.Services.Users;
using Microsoft.EntityFrameworkCore;
using static Eventuras.Domain.Registration;

namespace Eventuras.Services.Orders;

public class OrderRetrievalService : IOrderRetrievalService
{
    private readonly ApplicationDbContext _context;
    private readonly IOrderAccessControlService _orderAccessControlService;
    private readonly IOrganizationAccessControlService _organizationAccessControlService;
    private readonly IProductRetrievalService _productRetrievalService;
    private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;

    public OrderRetrievalService(
        ApplicationDbContext context,
        IOrderAccessControlService orderAccessControlService,
        IOrganizationAccessControlService organizationAccessControlService,
        IProductRetrievalService productRetrievalService,
        ICurrentOrganizationAccessorService currentOrganizationAccessorService)
    {
        _context = context ?? throw
            new ArgumentNullException(nameof(context));

        _orderAccessControlService = orderAccessControlService ?? throw
            new ArgumentNullException(nameof(orderAccessControlService));

        _organizationAccessControlService = organizationAccessControlService ?? throw
            new ArgumentNullException(nameof(organizationAccessControlService));

        _productRetrievalService = productRetrievalService ?? throw
            new ArgumentNullException(nameof(productRetrievalService));

        _currentOrganizationAccessorService = currentOrganizationAccessorService ?? throw
            new ArgumentNullException(nameof(currentOrganizationAccessorService));
    }

    public async Task<Order> GetOrderByIdAsync(int id,
        OrderRetrievalOptions options,
        CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .WithOptions(options ?? new OrderRetrievalOptions())
            .FirstOrDefaultAsync(o => o.OrderId == id, cancellationToken) ?? throw
            new NotFoundException($"Order {id} not found");

        await _orderAccessControlService.CheckOrderReadAccessAsync(order, cancellationToken);

        return order;
    }

    public async Task<Paging<Order>> ListOrdersAsync(
        OrderListRequest request,
        OrderRetrievalOptions options,
        CancellationToken cancellationToken)
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


    public async Task<ProductDeliverySummaryDto> GetProductDeliverySummaryAsync(int productId, CancellationToken cancellationToken)
    {
        var organization = await _currentOrganizationAccessorService.GetCurrentOrganizationAsync();
        await _organizationAccessControlService.CheckOrganizationReadAccessAsync(organization.OrganizationId);

        // Fetch orders and related data
        var orderLines = await _context.OrderLines
            .Include(ol => ol.Order)
                .ThenInclude(o => o.Registration)
                    .ThenInclude(r => r.User)
            .Where(ol => ol.ProductId == productId)
            .ToListAsync(cancellationToken);

        // Calculate ByStatus counts
        var byStatus = orderLines
            .GroupBy(ol => ol.Order.Registration.Status)
            .Aggregate(new ByRegistrationStatus(), (acc, group) =>
            {
                var status = group.Key;

                switch (status)
                {
                    case RegistrationStatus.Draft:
                        acc.Draft += group.Count();
                        break;
                    case RegistrationStatus.Cancelled:
                        acc.Cancelled += group.Count();
                        break;
                    case RegistrationStatus.Verified:
                        acc.Verified += group.Count();
                        break;
                    case RegistrationStatus.NotAttended:
                        acc.NotAttended += group.Count();
                        break;
                    case RegistrationStatus.Attended:
                        acc.Attended += group.Count();
                        break;
                    case RegistrationStatus.Finished:
                        acc.Finished += group.Count();
                        break;
                    case RegistrationStatus.WaitingList:
                        acc.WaitingList += group.Count();
                        break;
                }

                return acc;
            });

        // Create ProductDeliverySummaryDto with statistics
        var product = await _productRetrievalService.GetProductByIdAsync(productId);
        var productDeliverySummary = new ProductDeliverySummaryDto
        {
            Product = ProductSummaryDto.FromProduct(product),
            OrderSummary = orderLines
                .GroupBy(ol => ol.Order.Registration)
                .Select(group => new ProductOrdersSummaryDto
                {
                    RegistrationId = group.Key.RegistrationId,
                    RegistrationStatus = group.Key.Status,
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
                .ToList(),
            Statistics = new ProductStatisticsDto
            {
                ByRegistrationStatus = byStatus
            }
        };

        return productDeliverySummary;
    }




}
