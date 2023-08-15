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

    public Task<List<Product>> GetAsync()
    {
        return _db.Products.Include(p => p.ProductVariants).AsNoTracking().ToListAsync();
    }

    public Task<Product> GetAsync(int id)
    {
        return _db.Products.Where(p => p.ProductId == id)
            .Include(p => p.ProductVariants)
            .Include(p => p.EventInfo)
            .AsNoTracking()
            .SingleOrDefaultAsync();
    }

    public Task<List<Product>> GetProductsForEventAsync(int eventId)
    {
        return _db.Products.Where(p => p.EventInfoId == eventId)
            .Include(p => p.ProductVariants)
            .OrderBy(p => p.DisplayOrder)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<List<Registration>> GetRegistrationsForProductAsync(int productId)
    {
        var registrationIds = await _db.OrderLines.Where(l => l.Order.Status != OrderStatus.Cancelled && l.ProductId == productId)
            .GroupBy(l => l.Order.RegistrationId)
            .Where(g => g.Sum(l => l.Quantity) > 0)
            .Select(g => g.Key)
            .ToListAsync();

        var registrations = new List<Registration>();
        foreach (var id in registrationIds)
        {
            var reg = await _db.Registrations.Where(m => m.RegistrationId == id)
                .Include(m => m.User)
                .Include(m => m.Orders)
                .ThenInclude(ml => ml.OrderLines)
                .FirstOrDefaultAsync();

            // Only add if registration is not cancelled
            if (reg.Status != RegistrationStatus.Cancelled) registrations.Add(reg);
        }

        return registrations;
    }

    public async Task<List<Registration>> GetRegistrationsForProductVariantAsync(int productVariantId)
    {
        var registrationIds = await _db.OrderLines.Where(l => l.Order.Status != OrderStatus.Cancelled && l.ProductVariantId == productVariantId)
            .GroupBy(l => l.Order.RegistrationId)
            .Where(g => g.Sum(l => l.Quantity) > 0)
            .Select(g => g.Key)
            .ToListAsync();

        var registrations = new List<Registration>();

        foreach (var id in registrationIds)
        {
            var reg = await _db.Registrations.Where(m => m.RegistrationId == id)
                .Include(m => m.User)
                .Include(m => m.Orders)
                .ThenInclude(ml => ml.OrderLines)
                .FirstOrDefaultAsync();

            // Only add if registration is not cancelled
            if (reg.Status != RegistrationStatus.Cancelled) registrations.Add(reg);
        }

        /*
        foreach(var id in registrationIds)
        {
            var registration = await _db.Registrations.FindAsync(id);
            var task1 = _db.Entry(registration).Reference(r => r.User).LoadAsync();
            var task2 = _db.Entry(registration).Collection(r => r.Orders).LoadAsync();
            var task3 = _db.OrderLines.Where(l => l.Order.RegistrationId == id).LoadAsync();
            await Task.WhenAll(task1, task2, task3); // DON'T DO THIS, it will cause 'A second operation started on this context before a previous operation completed.'

            registrations.Add(registration);
        }
        */

        return registrations;
    }

    public async Task<bool> UpdateProductAsync(int productId, bool published)
    {
        var product = await _db.Products.Where(m => m.ProductId == productId).FirstOrDefaultAsync();

        product.Published = published;
        _db.Update(product);
        return await _db.SaveChangesAsync() > 0;
    }

    public async Task<bool> UpdateProductVariantAsync(int productVariantId, bool published)
    {
        var productVariant = await _db.ProductVariants.Where(m => m.ProductVariantId == productVariantId).FirstOrDefaultAsync();

        productVariant.Published = published;
        _db.Update(productVariant);
        return await _db.SaveChangesAsync() > 0;
    }
}