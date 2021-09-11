using System;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Orders
{
    public class OrderRetrievalService : IOrderRetrievalService
    {
        private readonly ApplicationDbContext _context;
        private readonly IOrderAccessControlService _orderAccessControlService;

        public OrderRetrievalService(
            ApplicationDbContext context,
            IOrderAccessControlService orderAccessControlService)
        {
            _context = context ?? throw
                new ArgumentNullException(nameof(context));

            _orderAccessControlService = orderAccessControlService ?? throw
                new ArgumentNullException(nameof(orderAccessControlService));
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

            return await Paging<Registration>.CreateAsync(query, request, cancellationToken);
        }
    }
}
