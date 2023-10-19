using Eventuras.Domain;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using static Eventuras.Domain.PaymentMethod;

namespace Eventuras.Services.Orders
{
    // FIXME: make refactoring, split into multiple services according to ISP and SRP

    [Obsolete]
    public interface IOrderService
    {
        // Orders
        Task<List<Order>> GetAsync();
        Task<List<Order>> GetWithRegistrationsAsync();
        Task<List<Order>> GetAsync(int count);
        Task<List<Order>> GetAsync(int count, int offset);

        Task<Order> GetByIdAsync(int orderId);
        Task<List<Order>> GetOrdersForEventAsync(int orderId);

        // Order details
        Task<bool> UpdateOrderDetailsAsync(int id, string customername, string customerEmail, string invoiceReference, string comments);
        Task<bool> UpdateOrderComment(int id, string comments);
        Task<bool> UpdatePaymentMethod(int orderId, PaymentProvider provider);
        Task<int> MakeOrderFreeAsync(int id);
        Task<int> DeleteOrderAsync(Order order);
        Task<int> DeleteOrderAsync(int orderId);

        // Order lines
        Task<OrderLine> GetOrderLineAsync(int lineId);
        Task<bool> DeleteOrderLineAsync(int lineId);
        Task<bool> AddOrderLineAsync(int orderId, int productId, int? variantId);
        Task<bool> UpdateOrderLine(int lineId, int? variantId, int quantity, decimal price);

        // Statuses
        Task<bool> MarkAsVerifiedAsync(int orderId);
        Task<bool> MarkAsCancelledAsync(int orderId);
        Task<Order> CreateDraftFromCancelledOrder(int orderId);

        // Log
        Task<bool> AddLogLineAsync(int orderId, string logText);
    }
}
