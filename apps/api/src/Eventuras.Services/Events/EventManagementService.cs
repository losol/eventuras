using System;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.Events;

internal class EventManagementService : IEventManagementService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<EventManagementService> _logger;
    private readonly IProductsService _productsService;

    public EventManagementService(
        ApplicationDbContext context,
        IProductsService productsService,
        ILogger<EventManagementService> logger)
    {
        _context = context ?? throw
            new ArgumentNullException(nameof(context));

        _productsService = productsService ?? throw
            new ArgumentNullException(nameof(productsService));

        _logger = logger ?? throw
            new ArgumentNullException(nameof(logger));
    }

    public async Task CreateNewEventAsync(EventInfo info)
    {
        if (info == null)
        {
            _logger.LogError("EventInfo is null");
            throw new ArgumentNullException(nameof(info));
        }

        if (await _context.EventInfos
                .AnyAsync(e => e.Slug == info.Slug))
        {
            _logger.LogError("Duplicate slug, cannot create event");
            throw new DuplicateException($"Event with code {info.Slug} already exists");
        }

        try
        {
            await _context.CreateAsync(info);
        }
        catch (DbUpdateException e) when (e.IsUniqueKeyViolation())
        {
            _logger.LogError("Duplicate slug, cannot create event");
            _context.EventInfos.Remove(info);
            throw new DuplicateException($"Event with code {info.Slug} already exists");
        }
    }

    public async Task UpdateEventAsync(EventInfo info)
    {
        if (info == null)
        {
            _logger.LogWarning("EventInfo is null");
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
            _logger.LogInformation($"Updating event with ID {info.EventInfoId}");
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
            _logger.LogInformation($"Archiving event with ID {id}");
            eventInfo.Archived = true;
            await _context.UpdateAsync(eventInfo);
        }
    }
}
