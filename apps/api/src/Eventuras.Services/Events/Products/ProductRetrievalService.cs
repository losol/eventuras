using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Eventuras.Services.Events.Products;

internal class ProductRetrievalService : IProductRetrievalService
{
    private readonly ApplicationDbContext _context;

    public ProductRetrievalService(ApplicationDbContext context) =>
        _context = context ?? throw
            new ArgumentNullException(nameof(context));

    public async Task<ICollection<Product>> ListProductsAsync(
        ProductListRequest request,
        ProductRetrievalOptions options,
        CancellationToken cancellationToken) =>
        await _context.Products
            .UseFilter(request.EventInfoId, request.Filter)
            .UseOrder(request.Order, request.Descending)
            .UseOptions(options ?? ProductRetrievalOptions.Default)
            .ToArrayAsync(cancellationToken);

    public async Task<Product> GetProductByIdAsync(
        int productId,
        ProductRetrievalOptions options,
        CancellationToken cancellationToken) =>
        await _context.Products
            .UseOptions(options ?? ProductRetrievalOptions.Default)
            .SingleOrDefaultAsync(p => p.ProductId == productId, cancellationToken)
        ?? throw new NotFoundException($"Product {productId} not found");
}
