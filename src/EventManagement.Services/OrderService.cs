using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace losol.EventManagement.Services
{
	public class OrderService : IOrderService
	{
		private readonly ApplicationDbContext _db;

		public OrderService(ApplicationDbContext db)
		{
			_db = db;
		}

		public Task<List<Order>> GetAsync() =>
			_db.Orders
		       .OrderByDescending(o => o.OrderTime)
		       .ToListAsync();

		public Task<List<Order>> GetAsync(int count, int offset) =>
			_db.Orders
		       .Skip(offset)
		       .Take(count)
		       .OrderByDescending(o => o.OrderTime)
		       .ToListAsync();

		public Task<List<Order>> GetAsync(int count) => GetAsync(count, 0);

		public Task<Order> GetByIdAsync(int orderId) =>
			_db.Orders
			   .Where(o => o.OrderId == orderId)
			   .Include(o => o.OrderLines)
			   .Include(o => o.User)
		       .Include(o => o.Registration)
			   .SingleOrDefaultAsync();

		public Task<OrderLine> GetOrderLineAsync(int lineId) =>
			_db.OrderLines
			   .Where(l => l.OrderLineId == lineId)
		       .Include(l => l.Order)
			   .SingleOrDefaultAsync();

		public async Task<bool> DeleteOrderLineAsync(int lineId)
		{
			var line = await GetOrderLineAsync(lineId);
			if(!line.Order.CanEdit)
			{
				throw new InvalidOperationException("The order line cannot be edited anymore.");
			}

			_db.OrderLines.Remove(line);
			return await _db.SaveChangesAsync() > 0;
		}
	}
}
