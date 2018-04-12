using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Services
{
	public interface IOrderService
	{
		// Orders
		Task<List<Order>> GetAsync();
		Task<List<Order>> GetAsync(int count);
		Task<List<Order>> GetAsync(int count, int offset);
		
		Task<Order> GetByIdAsync(int orderId);
		Task<List<Order>> GetOrdersForEventAsync(int orderId);

		// Order details
		Task<bool> UpdateOrderDetailsAsync(int id, string customername, string customerEmail, string invoiceReference, string comments);
		Task<int> DeleteOrderAsync(Order order);

		// Order lines
		Task<OrderLine> GetOrderLineAsync(int lineId);
		Task<bool> DeleteOrderLineAsync(int lineId);
		Task<bool> AddOrderLineAsync(int orderId, int productId, int? variantId);
		Task<bool> UpdateOrderLine(int lineId, int quantity, decimal price);

		// Statuses
		Task<bool> MarkAsVerifiedAsync(int orderId);
		Task<bool> MarkAsInvoicedAsync(int orderId);
		Task<bool> MarkAsCancelledAsync(int orderId);
	}
}
