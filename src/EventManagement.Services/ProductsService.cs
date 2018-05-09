using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using Microsoft.EntityFrameworkCore;
using static losol.EventManagement.Domain.Order;

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

		public Task<Product> GetAsync(int id)
		{
			return _db.Products
					  .Where(p => p.ProductId == id)
				      .Include(p => p.ProductVariants)
				      .Include(p => p.Eventinfo)
				      .AsNoTracking()
				      .SingleOrDefaultAsync();
		}

		public Task<List<Product>> GetProductsForEventAsync(int eventId)
		{
			return _db.Products
				      .Where(p => p.EventInfoId == eventId)
					  .Include(p => p.ProductVariants)
					  .AsNoTracking()
					  .ToListAsync();
		}

		public Task<List<Registration>> GetRegistrationsForProductAsync(int productId)
		{
			return _db.Registrations
				.Where(r => r.Orders.Any(o => o.Status != OrderStatus.Cancelled && o.OrderLines.Any(l => l.ProductId == productId)))
				.Include(r => r.User)
				.Include(r => r.Orders)
					.ThenInclude(o => o.OrderLines)
				.AsNoTracking()
				.ToListAsync();
		}


		public async Task<List<Registration>> GetRegistrationsForProductVariantAsync(int productVariantId)
		{
			var registrations = await _db.Registrations
				.Where(r => r.Orders.Any(o => o.Status != OrderStatus.Cancelled && 
					o.OrderLines.Any(l => l.ProductVariantId == productVariantId) == true))
				.Include(r => r.User)
				.Include(r => r.Orders)
					.ThenInclude(o => o.OrderLines)
				.AsNoTracking()
				.ToListAsync();

			return registrations;
		}


		public async Task<bool> UpdateProductAsync(int productId, bool published) {
			var product = await _db.Products
				.Where( m => m.ProductId == productId)
				.FirstOrDefaultAsync();
			
			product.Published = published;
			_db.Update(product);
			return await _db.SaveChangesAsync() > 0;
		}

		public async Task<bool> UpdateProductVariantAsync(int productVariantId, bool published) {
			var productVariant = await _db.ProductVariants
				.Where( m => m.ProductVariantId == productVariantId)
				.FirstOrDefaultAsync();
			
			productVariant.Published = published;
			_db.Update(productVariant);
			return await _db.SaveChangesAsync() > 0;
		}
	}
}
