using System;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Orders
{
    public class OrderRetrievalService : IOrderRetrievalService
    {
        private readonly ApplicationDbContext _context;

        public OrderRetrievalService(ApplicationDbContext context)
        {
            _context = context ?? throw
                new ArgumentNullException(nameof(context));
        }

        public async Task<Order> GetOrderByIdAsync(int id,
            OrderRetrievalOptions options,
            CancellationToken cancellationToken)
        {
            return await _context.Orders
                .WithOptions(options ?? new OrderRetrievalOptions())
                .FirstOrDefaultAsync(o => o.OrderId == id, cancellationToken);
        }
    }
}
