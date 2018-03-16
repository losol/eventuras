using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace losol.EventManagement.Services
{
	public class ProductsService : IProductsService
	{
		private readonly ApplicationDbContext _db;

		public ProductsService(ApplicationDbContext db)
		{
			_db = db;
		}

		public Task<List<Product>> GetAsync()
		{
			return _db.Products
				      .Include(p => p.ProductVariants)
				      .AsNoTracking()
				      .ToListAsync();
		}

		public Task<List<Product>> GetForEventAsync(int eventId)
		{
			return _db.Products
				      .Where(p => p.EventInfoId == eventId)
					  .Include(p => p.ProductVariants)
					  .AsNoTracking()
					  .ToListAsync();
		}

		public async Task<List<Registration>> GetVerifiedRegistrationsAsync(int productId)
		{
			return await _db.Products
				            .Where(p => p.ProductId == productId)
				            .SelectMany(p => p.Eventinfo.Registrations.Where(r => r.Verified))
				            .Include(r => r.User)
				            .Include(r => r.Order)
				            .AsNoTracking()
				            .ToListAsync();
		}
	}
}
