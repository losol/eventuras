using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Events;

internal class EventProductsManagementService : IEventProductsManagementService
{
    private readonly IEventInfoAccessControlService _accessControlService;
    private readonly ApplicationDbContext _context;
    private readonly IEventInfoRetrievalService _eventInfoRetrievalService;

    public EventProductsManagementService(
        ApplicationDbContext context,
        IEventInfoRetrievalService eventInfoRetrievalService,
        IEventInfoAccessControlService accessControlService)
    {
        _context = context ?? throw
            new ArgumentNullException(nameof(context));

        _eventInfoRetrievalService = eventInfoRetrievalService ?? throw
            new ArgumentNullException(nameof(eventInfoRetrievalService));

        _accessControlService = accessControlService ?? throw
            new ArgumentNullException(nameof(accessControlService));
    }

    public async Task UpdateEventProductsAsync(int eventId, List<Product> products)
    {
        if (products is null)
        {
            throw new ArgumentNullException(nameof(products));
        }

        await CheckEventAccessAsync(eventId);

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

    public async Task AddProductAsync(Product product)
    {
        if (product == null)
        {
            throw new ArgumentNullException(nameof(product));
        }

        await CheckEventAccessAsync(product.EventInfoId);

        await _context.CreateAsync(product);
    }

    public async Task UpdateProductAsync(Product product)
    {
        if (product == null)
        {
            throw new ArgumentNullException(nameof(product));
        }

        await CheckEventAccessAsync(product.EventInfoId);

        await _context.UpdateAsync(product);
    }

    public async Task ArchiveProductAsync(Product product)
    {
        if (product == null)
        {
            throw new ArgumentNullException(nameof(product));
        }

        await CheckEventAccessAsync(product.EventInfoId);

        product.Archived = true;

        await _context.UpdateAsync(product);
    }

    private async Task CheckEventAccessAsync(int eventId)
    {
        var eventInfo = await _eventInfoRetrievalService.GetEventInfoByIdAsync(eventId);
        await _accessControlService.CheckEventManageAccessAsync(eventInfo);
    }
}
