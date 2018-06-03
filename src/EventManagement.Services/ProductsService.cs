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

		public async Task<List<Registration>> GetRegistrationsForProductAsync(int productId)
		{
            var registrationIds = await _db.OrderLines
                .Where(l => l.Order.Status != OrderStatus.Cancelled && l.ProductId == productId)
                .GroupBy(l => l.Order.RegistrationId)
                .Where(g => g.Sum(l => l.Quantity) > 0)
                .Select(g => g.Key)
                .ToListAsync();

            List<Registration> registrations = new List<Registration>();
            foreach(var id in registrationIds)
            {
                var registration = await _db.Registrations.FindAsync(id);
                var task1 = _db.Entry(registration).Reference(r => r.User).LoadAsync();
                var task2 = _db.Entry(registration).Collection(r => r.Orders).LoadAsync();
                var task3 = _db.OrderLines.Where(l => l.Order.RegistrationId == id).LoadAsync();
                await Task.WhenAll(task1, task2, task3);

                registrations.Add(registration);
            }

            return registrations;
		}


		public async Task<List<Registration>> GetRegistrationsForProductVariantAsync(int productVariantId)
		{
			var registrationIds = await _db.OrderLines
                .Where(l => l.Order.Status != OrderStatus.Cancelled && l.ProductVariantId == productVariantId)
                .GroupBy(l => l.Order.RegistrationId)
                .Where(g => g.Sum(l => l.Quantity) > 0)
                .Select(g => g.Key)
                .ToListAsync();

            List<Registration> registrations = new List<Registration>();
            foreach(var id in registrationIds)
            {
                var registration = await _db.Registrations.FindAsync(id);
                var task1 = _db.Entry(registration).Reference(r => r.User).LoadAsync();
                var task2 = _db.Entry(registration).Collection(r => r.Orders).LoadAsync();
                var task3 = _db.OrderLines.Where(l => l.Order.RegistrationId == id).LoadAsync();
                await Task.WhenAll(task1, task2, task3);

                registrations.Add(registration);
            }

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
