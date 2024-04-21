using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Events;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Organizations;
using Eventuras.Services.Users;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Orders;

public class OrderRetrievalService : IOrderRetrievalService
{
    private readonly ApplicationDbContext _context;
    private readonly IOrderAccessControlService _orderAccessControlService;
    private readonly IOrganizationAccessControlService _organizationAccessControlService;
    private readonly ICurrentOrganizationAccessorService _currentOrganizationAccessorService;

    public OrderRetrievalService(
        ApplicationDbContext context,
        IOrderAccessControlService orderAccessControlService,
        IOrganizationAccessControlService organizationAccessControlService,
        ICurrentOrganizationAccessorService currentOrganizationAccessorService)
    {
        _context = context ?? throw
            new ArgumentNullException(nameof(context));

        _orderAccessControlService = orderAccessControlService ?? throw
            new ArgumentNullException(nameof(orderAccessControlService));

        _organizationAccessControlService = organizationAccessControlService ?? throw
            new ArgumentNullException(nameof(organizationAccessControlService));

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


    public async Task<List<ProductOrdersSummaryDto>> GetProductOrdersSummaryAsync(int productId, CancellationToken cancellationToken)
    {
        var organization = await _currentOrganizationAccessorService.GetCurrentOrganizationAsync();
        await _organizationAccessControlService.CheckOrganizationReadAccessAsync(organization.OrganizationId);

        // Fetch OrderLines with the specified ProductId and include necessary related data
        var orderLines = await _context.OrderLines
            .Include(ol => ol.Order)
                .ThenInclude(o => o.Registration)
                    .ThenInclude(r => r.User)
            .Where(ol => ol.ProductId == productId)
            .ToListAsync(cancellationToken);

        // Group OrderLines by Registration to build summary
        var groupedRegistrations = orderLines
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
            .ToList();

        return groupedRegistrations;
    }




}
