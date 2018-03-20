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

		public Task<List<Order>> GetAsync()
		{
			return _db.Orders
				      .OrderByDescending(o => o.OrderTime)
					  .ToListAsync();
		}

		public Task<List<Order>> GetAsync(int count, int offset)
		{
			return _db.Orders
				      .Skip(offset)
				      .Take(count)
				      .OrderByDescending(o => o.OrderTime)
					  .ToListAsync();
		}
		public Task<List<Order>> GetAsync(int count) => GetAsync(0, count);
	}
}
