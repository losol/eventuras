using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using static Eventuras.Domain.Order;
using static Eventuras.Domain.Registration;

namespace Eventuras.Services;

public class ProductsService : IProductsService
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger _logger;

    public ProductsService(ApplicationDbContext db, ILogger<ProductsService> logger)
    {
        _db = db;
        _logger = logger;
    }

    // Get all products
    public Task<List<Product>> GetAsync() =>
        _db.Products
            .Include(p => p.ProductVariants)
            .AsNoTracking()
            .ToListAsync();

    // Get a product by ID
    public Task<Product> GetAsync(int id) =>
        _db.Products
            .Where(p => p.ProductId == id)
            .Include(p => p.ProductVariants)
            .Include(p => p.EventInfo)
            .AsNoTracking()
            .SingleOrDefaultAsync();

    // Get products for a specific event
    public Task<List<Product>> GetProductsForEventAsync(int eventId) =>
        _db.Products
            .Where(p => p.EventInfoId == eventId)
            .Include(p => p.ProductVariants)
            .OrderBy(p => p.DisplayOrder)
            .AsNoTracking()
            .ToListAsync();

    // Get registrations for a product
    public async Task<List<Registration>> GetRegistrationsForProductAsync(int productId)
    {
        _logger.LogInformation("Getting registrations for product {ProductId}", productId);
        var registrationIds = await _db.OrderLines
            .Where(l => l.Order.Status != OrderStatus.Cancelled && l.ProductId == productId)
            .GroupBy(l => l.Order.RegistrationId)
            .Where(g => g.Sum(l => l.Quantity) > 0) // Exclude net quantity = 0
            .Select(g => g.Key)
            .ToListAsync();

        var registrations = new List<Registration>();

        foreach (var id in registrationIds)
        {
            var reg = await _db.Registrations
                .Where(m => m.RegistrationId == id)
                .Include(m => m.User)
                .Include(m => m.Orders)
                .ThenInclude(o => o.OrderLines)
                .FirstOrDefaultAsync();

            // Only add if registration is not cancelled
            if (reg?.Status != RegistrationStatus.Cancelled)
            {
                registrations.Add(reg);
            }
        }

        return registrations;
    }

    // Get registrations for a product variant
    public async Task<List<Registration>> GetRegistrationsForProductVariantAsync(int productVariantId)
    {
        var registrationIds = await _db.OrderLines
            .Where(l => l.Order.Status != OrderStatus.Cancelled && l.ProductVariantId == productVariantId)
            .GroupBy(l => l.Order.RegistrationId)
            .Where(g => g.Sum(l => l.Quantity) > 0) // Exclude net quantity = 0
            .Select(g => g.Key)
            .ToListAsync();

        var registrations = new List<Registration>();

        foreach (var id in registrationIds)
        {
            var reg = await _db.Registrations
                .Where(m => m.RegistrationId == id)
                .Include(m => m.User)
                .Include(m => m.Orders)
                .ThenInclude(o => o.OrderLines)
                .FirstOrDefaultAsync();

            // Only add if registration is not cancelled
            if (reg?.Status != RegistrationStatus.Cancelled)
            {
                registrations.Add(reg);
            }
        }

        return registrations;
    }

    // Update a product's published status
    public async Task<bool> UpdateProductAsync(int productId, bool published)
    {
        var product = await _db.Products
            .Where(m => m.ProductId == productId)
            .FirstOrDefaultAsync();

        if (product == null)
        {
            return false;
        }

        product.Published = published;
        _db.Update(product);
        return await _db.SaveChangesAsync() > 0;
    }

    // Update a product variant's published status
    public async Task<bool> UpdateProductVariantAsync(int productVariantId, bool published)
    {
        var productVariant = await _db.ProductVariants
            .Where(m => m.ProductVariantId == productVariantId)
            .FirstOrDefaultAsync();

        if (productVariant == null)
        {
            return false;
        }

        productVariant.Published = published;
        _db.Update(productVariant);
        return await _db.SaveChangesAsync() > 0;
    }
}
