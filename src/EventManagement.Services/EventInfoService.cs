using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace losol.EventManagement.Services
{
	public class EventInfoService : IEventInfoService
	{
		private readonly ApplicationDbContext _db;
		private readonly IProductsService _productsService;

		public EventInfoService(ApplicationDbContext db, IProductsService productsService)
		{
			_db = db;
			_productsService = productsService;
		}

		public async Task<List<EventInfo>> GetFeaturedEventsAsync() 
		{
			return await _db.EventInfos
				.Where(
					i => i.Published && 
					i.Featured &&
					i.DateStart >= DateTime.Now
					)
				.OrderBy(s => s.DateStart)
				.ToListAsync();
		}

		public async Task<List<EventInfo>> GetOnDemandEventsAsync() 
		{
			return await _db.EventInfos
				.Where(i => 
					i.Published && 
					i.OnDemand 
					)
				.OrderBy(s => s.Title)
				.ToListAsync();
		}

		// TODO: Add events which is spanning over several days.
		public async Task<List<EventInfo>> GetOngoingEventsAsync() 
		{
			return await _db.EventInfos
				.Where(i => 
					i.Published && 
					i.DateStart.Value.Date == DateTime.Now.Date ||
					(i.DateStart.Value.Date <= DateTime.Now.Date &&
					i.DateEnd.Value.Date >= DateTime.Now.Date))
				.OrderBy(s => s.DateStart)
				.ToListAsync();
		}

		public async Task<List<EventInfo>> GetEventsAsync()
		{
			return await _db.EventInfos
				.Where(a => 
					a.Published &&
					a.DateStart >= DateTime.Now)
				.OrderBy(a => a.DateStart)
				.ToListAsync();
		}

		public async Task<EventInfo> GetAsync(int id)
		{
			return await _db.EventInfos
				            .SingleOrDefaultAsync(m => m.EventInfoId == id);
		}

		public async Task<EventInfo> GetWithOrganizerAsync(int id)
		{
			var eventinfo = await _db.EventInfos
				.Where(m => m.EventInfoId == id)
				.Include ( m => m.OrganizerUser)
				.Include ( m => m.Organization)
				.SingleOrDefaultAsync();
			return eventinfo;

		}

		public async Task<int> GetRegistrationCount(int eventId)
		{
			return await _db.EventInfos
							.Where(e => e.EventInfoId == eventId)
				            .Select(e => e.Registrations.Where(r => r.Verified).Count())
				            .SingleAsync();
		}

		public async Task<EventInfo> GetWithProductsAsync(int id)
		{
			return await _db.EventInfos
				            .Include(ei => ei.Products)
				            	.ThenInclude(products => products.ProductVariants)
							.SingleOrDefaultAsync(m => m.EventInfoId == id);
		}

		public async Task<bool> AddAsync(EventInfo info)
		{
			await _db.EventInfos.AddAsync(info);
			return await _db.SaveChangesAsync() > 0;
		}

		public async Task<bool> UpdateEventWithProductsAsync(EventInfo info)
		{
			bool shouldDeleteProducts = info.Products != null;
			bool result = true;
			
			if(shouldDeleteProducts)
			{
				var originalProducts = await _productsService.GetProductsForEventAsync(info.EventInfoId);
				var originalVariants = originalProducts.SelectMany(p => p.ProductVariants);

				// Delete the variants that don't exist in the provided object
				var providedVariants = info.Products
				                           .Where(p => p.ProductVariants != null)
				                           .SelectMany(p => p.ProductVariants);
				var variantsToDelete = originalVariants.Where(
					originalVariant => !providedVariants
											.Any(variant => variant.ProductVariantId == originalVariant.ProductVariantId)
				);
				_db.ProductVariants.RemoveRange(variantsToDelete);
				result &= await _db.SaveChangesAsync() == variantsToDelete.Count();

				// Delete the products that don't exist in the provided object
				var producstToDelete = originalProducts.Where(op => !info.Products.Any(p => p.ProductId == op.ProductId));
				_db.Products.RemoveRange(producstToDelete);
				result &= await _db.SaveChangesAsync() == producstToDelete.Count();
			}

			// Save the updates
			_db.DetachAllEntities();
			_db.EventInfos.Update(info);
			result &= await _db.SaveChangesAsync() > 0;

			return result;
		}
	}
}
