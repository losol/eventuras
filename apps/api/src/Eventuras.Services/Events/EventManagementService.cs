using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Auth;
using Eventuras.Services.BusinessEvents;
using Eventuras.Services.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.Events;

internal class EventManagementService : IEventManagementService
{
    private readonly IBusinessEventService _businessEventService;
    private readonly ApplicationDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<EventManagementService> _logger;
    private readonly IProductsService _productsService;

    public EventManagementService(
        ApplicationDbContext context,
        IProductsService productsService,
        IBusinessEventService businessEventService,
        IHttpContextAccessor httpContextAccessor,
        ILogger<EventManagementService> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _productsService = productsService ?? throw new ArgumentNullException(nameof(productsService));
        _businessEventService =
            businessEventService ?? throw new ArgumentNullException(nameof(businessEventService));
        _httpContextAccessor =
            httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
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

    public async Task UpdateEventAsync(EventInfo info, CancellationToken cancellationToken = default)
    {
        if (info == null)
        {
            _logger.LogWarning("EventInfo is null");
            throw new ArgumentNullException(nameof(info));
        }

        // Load pre-update state with AsNoTracking, separate from the incoming
        // (already-mutated) entity, so we can detect status deltas after save.
        var before = await _context.EventInfos
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.EventInfoId == info.EventInfoId, cancellationToken);

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
            await _context.SaveChangesAsync(cancellationToken);
        }

        if (await _context.EventInfos
                .AnyAsync(e => e.Slug == info.Slug &&
                               e.EventInfoId != info.EventInfoId &&
                               !e.Archived, cancellationToken))
        {
            throw new DuplicateException($"Event with code {info.Slug} already exists");
        }

        try
        {
            _logger.LogInformation("Updating event with ID {EventInfoId}", info.EventInfoId);
            await _context.UpdateAsync(info, cancellationToken);
        }
        catch (DbUpdateException e) when (e.IsUniqueKeyViolation())
        {
            _context.DisableChangeTracking(info);
            throw new DuplicateException($"Event with code {info.Slug} already exists");
        }

        if (before != null && before.Status != info.Status)
        {
            await EmitStatusChangedAsync(info, before.Status, cancellationToken);
        }
    }

    public async Task DeleteEventAsync(int id)
    {
        var eventInfo = await _context.EventInfos.FindAsync(id);
        if (eventInfo != null)
        {
            _logger.LogInformation("Archiving event with ID {Id}", id);
            eventInfo.Archived = true;
            await _context.UpdateAsync(eventInfo);
        }
    }

    private async Task EmitStatusChangedAsync(
        EventInfo info,
        EventInfo.EventInfoStatus oldStatus,
        CancellationToken cancellationToken)
    {
        // Tenant: derived from the event's organization, not any request
        // header — audit data tracks the resource's owner.
        var organizationUuid = await _context.Organizations
            .AsNoTracking()
            .Where(o => o.OrganizationId == info.OrganizationId)
            .Select(o => (Guid?)o.Uuid)
            .FirstOrDefaultAsync(cancellationToken);

        // Actor: the authenticated user from the current request, if any.
        // Null for background jobs / anonymous paths.
        var actorUserUuid = _httpContextAccessor.HttpContext?.User?.GetUserId();

        _businessEventService.AddEvent(
            BusinessEventSubjects.ForEvent(info.Uuid),
            "event.status.changed",
            $"Status changed from {oldStatus} to {info.Status}",
            organizationUuid: organizationUuid,
            actorUserUuid: actorUserUuid);
    }
}
