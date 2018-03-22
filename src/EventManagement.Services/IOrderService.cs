using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Services
{
	public interface IOrderService
	{
		Task<List<Order>> GetAsync();
		Task<List<Order>> GetAsync(int count, int offset);
		Task<List<Order>> GetAsync(int count);
		Task<Order> GetByIdAsync(int orderId);

		Task<OrderLine> GetOrderLineAsync(int lineId);
		Task<bool> DeleteOrderLineAsync(int lineId);
	}
}
