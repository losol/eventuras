﻿using System;
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
		Task<List<Order>> GetOrdersForEventAsync(int orderId);

		Task<OrderLine> GetOrderLineAsync(int lineId);
		Task<bool> DeleteOrderLineAsync(int lineId);
		Task<bool> AddOrderLineAsync(int orderId, int productId, int? variantId);
		Task<bool> UpdateOrderLine(int lineId, int quantity, decimal price);
		Task<bool> UpdateOrderDetailsAsync(int id, string customername, string customerEmail, string invoiceReference, string comments);
	}
}
