using System;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;

namespace Eventuras.Services.Orders
{
    public class OrderManagementService : IOrderManagementService
    {
        private readonly IOrderAccessControlService _orderAccessControlService;
        private readonly ApplicationDbContext _context;

        public OrderManagementService(
            IOrderAccessControlService orderAccessControlService,
            ApplicationDbContext context)
        {
            _orderAccessControlService = orderAccessControlService ?? throw
                new ArgumentNullException(nameof(orderAccessControlService));

            _context = context ?? throw
                new ArgumentNullException(nameof(context));
        }

        public async Task CancelOrderAsync(Order order)
        {
            if (order == null)
            {
                throw new ArgumentNullException(nameof(order));
            }

            await _orderAccessControlService.CheckOrderUpdateAccessAsync(order);
            
            order.MarkAsCancelled();
            
            await _context.UpdateAsync(order);
        }
    }
}
