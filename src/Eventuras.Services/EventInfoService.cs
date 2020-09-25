using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.EntityFrameworkCore;
using static Eventuras.Domain.EventInfo;

namespace Eventuras.Services
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
                .Where(i =>
                   i.Status != EventInfoStatus.Cancelled &&
                   i.Status != EventInfoStatus.Draft &&
                   i.Featured &&
                   i.DateStart >= DateTime.Now
                    )
                .OrderBy(s => s.DateStart)
                .ToListAsync();
        }

        public async Task<List<EventInfo>> GetUnpublishedEventsAsync()
        {
            return await _db.EventInfos
                .Where(i =>
                   i.Status == EventInfoStatus.Draft ||
                   i.Status == EventInfoStatus.Cancelled)
                .OrderBy(s => s.DateStart)
                .ToListAsync();
        }

        public async Task<List<EventInfo>> GetOnDemandEventsAsync()
        {
            return await _db.EventInfos
                .Where(i =>
                    i.Status != EventInfoStatus.Cancelled &&
                    i.Status != EventInfoStatus.Draft &&
                    i.Type == EventInfoType.OnlineCourse
                    )
                .OrderBy(s => s.Title)
                .ToListAsync();
        }

        public async Task<List<EventInfo>> GetOngoingEventsAsync()
        {
            return await _db.EventInfos
                .Where(i =>
                    i.Status != EventInfoStatus.Cancelled &&
                    i.Status != EventInfoStatus.Draft &&

                    ((i.DateStart.HasValue &&
                    i.DateStart.Value.Date == DateTime.Now.Date) ||

                    (i.DateStart.HasValue && i.DateEnd.HasValue) &&
                    (i.DateStart.Value.Date <= DateTime.Now.Date &&
                    i.DateEnd.Value.Date >= DateTime.Now.Date)))
                .OrderBy(s => s.DateStart)
                .ToListAsync();
        }

        public async Task<List<EventInfo>> GetEventsAsync()
        {
            return await _db.EventInfos
                .Where(i =>
                    i.Status != EventInfoStatus.Cancelled &&
                    i.Status != EventInfoStatus.Draft &&
                    i.DateStart >= DateTime.Now)
                .OrderBy(a => a.DateStart)
                .ToListAsync();
        }

        public async Task<List<EventInfo>> GetPastEventsAsync()
        {
            return await _db.EventInfos
                .Where(i =>
                    i.Status != EventInfoStatus.Cancelled &&
                    i.Status != EventInfoStatus.Draft &&
                    ((i.DateStart <= DateTime.Now) ||
                    (!i.DateStart.HasValue)))
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
                .Include(m => m.OrganizerUser)
                .Include(m => m.Organization)
                .SingleOrDefaultAsync();
            return eventinfo;
        }

        public async Task<EventInfo> GetWithProductsAsync(int id)
        {
            return await _db.EventInfos
                            .Include(ei => ei.Products)
                                .ThenInclude(products => products.ProductVariants)
                            .AsNoTracking()
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

            if (shouldDeleteProducts)
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

        public async Task<bool> UpdateEventProductsAsync(int eventId, List<Product> products)
        {
            if (products is null) throw new ArgumentNullException(paramName: nameof(products));
            bool result = true;

            var originalProducts = await _db.Products.Where(p => p.EventInfoId == eventId)
                .Include(p => p.ProductVariants).AsNoTracking().ToArrayAsync();
            var originalVariants = originalProducts.SelectMany(p => p.ProductVariants).ToArray();

            // Delete the variants that don't exist in the provided object
            var providedVariants = products
                                       .Where(p => p.ProductVariants != null)
                                       .SelectMany(p => p.ProductVariants);
            var variantsToDelete = originalVariants
                .Where(originalVariant => providedVariants.All(variant => variant.ProductVariantId != originalVariant.ProductVariantId))
                .ToList();
            if (variantsToDelete.Any())
            {
                _db.ProductVariants.AttachRange(variantsToDelete);
                _db.ProductVariants.RemoveRange(variantsToDelete);
                result &= await _db.SaveChangesAsync() == variantsToDelete.Count();
            }

            // Delete the products that don't exist in the provided object
            var productsToDelete = originalProducts.Where(op => products.All(p => p.ProductId != op.ProductId)).ToList();
            if (productsToDelete.Any())
            {
                _db.Products.AttachRange(productsToDelete);
                _db.Products.RemoveRange(productsToDelete);
                result &= await _db.SaveChangesAsync() == productsToDelete.Count();
            }

            // Save the updates
            var info = await _db.EventInfos
                .Where(e => e.EventInfoId == eventId)
                .Include(ei => ei.Products)
                .ThenInclude(p => p.ProductVariants)
                .AsNoTracking()
                .SingleAsync();
            info.Products = products;
            _db.DetachAllEntities();
            _db.EventInfos.Update(info);
            result &= await _db.SaveChangesAsync() > 0;

            return result;
        }
    }
}
