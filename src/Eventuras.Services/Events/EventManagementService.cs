using Eventuras.Domain;
using Eventuras.Infrastructure;
using System;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Services.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Events
{
    internal class EventManagementService : IEventManagementService
    {
        private readonly ApplicationDbContext _context;
        private readonly IProductsService _productsService;

        public EventManagementService(
            ApplicationDbContext context,
            IProductsService productsService)
        {
            _context = context ?? throw
                new ArgumentNullException(nameof(context));

            _productsService = productsService ?? throw
                new ArgumentNullException(nameof(productsService));
        }

        public async Task CreateNewEventAsync(EventInfo info)
        {
            if (info == null)
            {
                throw new ArgumentNullException(nameof(info));
            }

            if (await _context.EventInfos
                .AnyAsync(e => e.Slug == info.Slug))
            {
                throw new DuplicateException($"Event with code {info.Slug} already exists");
            }

            try
            {
                await _context.CreateAsync(info);
            }
            catch (DbUpdateException e) when (e.IsUniqueKeyViolation())
            {
                _context.EventInfos.Remove(info);
                throw new DuplicateException($"Event with code {info.Slug} already exists");
            }
        }

        public async Task UpdateEventAsync(EventInfo info)
        {
            if (info == null)
            {
                throw new ArgumentNullException(nameof(info));
            }

            if (info.Products != null)
            {
                var originalProducts = await _productsService
                    .GetProductsForEventAsync(info.EventInfoId);

                var originalVariants = originalProducts
                    .SelectMany(p => p.ProductVariants);

                // Delete the variants that don't exist in the provided object
                var providedVariants = info.Products
                    .Where(p => p.ProductVariants != null)
                    .SelectMany(p => p.ProductVariants);

                var variantsToDelete = originalVariants
                    .Where(originalVariant => providedVariants.All(variant =>
                        variant.ProductVariantId != originalVariant.ProductVariantId));

                _context.ProductVariants.RemoveRange(variantsToDelete);

                // Delete the products that don't exist in the provided object
                var productsToDelete = originalProducts
                    .Where(op => info.Products.All(p =>
                        p.ProductId != op.ProductId));

                _context.Products.RemoveRange(productsToDelete);
                await _context.SaveChangesAsync();
            }

            if (await _context.EventInfos
                .AnyAsync(e => e.Slug == info.Slug &&
                               e.EventInfoId != info.EventInfoId &&
                               !e.Archived))
            {
                throw new DuplicateException($"Event with code {info.Slug} already exists");
            }

            try
            {
                await _context.UpdateAsync(info);
            }
            catch (DbUpdateException e) when (e.IsUniqueKeyViolation())
            {
                _context.DisableChangeTracking(info);
                throw new DuplicateException($"Event with code {info.Slug} already exists");
            }
        }

        public async Task DeleteEventAsync(int id)
        {
            var eventInfo = await _context.EventInfos.FindAsync(id);
            if (eventInfo != null)
            {
                eventInfo.Archived = true;
                await _context.UpdateAsync(eventInfo);
            }
        }
    }
}
