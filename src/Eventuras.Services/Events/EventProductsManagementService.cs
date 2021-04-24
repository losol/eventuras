using Eventuras.Domain;
using Eventuras.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Events
{
    internal class EventProductsManagementService : IEventProductsManagementService
    {
        private readonly ApplicationDbContext _context;

        public EventProductsManagementService(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task UpdateEventProductsAsync(int eventId, List<Product> products)
        {
            if (products is null)
            {
                throw new ArgumentNullException(paramName: nameof(products));
            }

            var originalProducts = await _context.Products
                .Where(p => p.EventInfoId == eventId)
                .Include(p => p.ProductVariants)
                .AsNoTracking()
                .ToArrayAsync();

            var originalVariants = originalProducts
                .SelectMany(p => p.ProductVariants)
                .ToArray();

            // Delete the variants that don't exist in the provided object
            var providedVariants = products
                                       .Where(p => p.ProductVariants != null)
                                       .SelectMany(p => p.ProductVariants);

            var variantsToDelete = originalVariants
                .Where(originalVariant => providedVariants.All(variant =>
                    variant.ProductVariantId != originalVariant.ProductVariantId))
                .ToList();

            if (variantsToDelete.Any())
            {
                _context.ProductVariants.AttachRange(variantsToDelete);
                _context.ProductVariants.RemoveRange(variantsToDelete);
                await _context.SaveChangesAsync();
            }

            // Delete the products that don't exist in the provided object
            var productsToDelete = originalProducts
                .Where(op => products.All(p =>
                    p.ProductId != op.ProductId)).ToList();

            if (productsToDelete.Any())
            {
                _context.Products.AttachRange(productsToDelete);
                _context.Products.RemoveRange(productsToDelete);
                await _context.SaveChangesAsync();
            }

            // Save the updates
            var info = await _context.EventInfos
                .Where(e => e.EventInfoId == eventId)
                .Include(ei => ei.Products)
                .ThenInclude(p => p.ProductVariants)
                .AsNoTracking()
                .SingleAsync();

            info.Products = products;

            _context.DetachAllEntities();
            _context.EventInfos.Update(info);

            await _context.SaveChangesAsync();
        }
    }
}
