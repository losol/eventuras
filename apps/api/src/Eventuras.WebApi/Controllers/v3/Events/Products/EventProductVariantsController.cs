using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Domain;
using Eventuras.Services.Events;
using Eventuras.Services.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.v3.Events.Products;

[ApiVersion("3")]
[Authorize(Policy = Constants.Auth.AdministratorRole)]
[Route("v{version:apiVersion}/events/{eventId}/products/{productId}/variants")]
[ApiController]
public class EventProductVariantsController : ControllerBase
{
    private readonly IEventInfoRetrievalService _eventInfoRetrievalService;
    private readonly IEventProductsManagementService _eventProductsManagementService;

    public EventProductVariantsController(
        IEventInfoRetrievalService eventInfoRetrievalService,
        IEventProductsManagementService eventProductsManagementService)
    {
        _eventInfoRetrievalService = eventInfoRetrievalService ?? throw
            new ArgumentNullException(nameof(eventInfoRetrievalService));

        _eventProductsManagementService = eventProductsManagementService ?? throw
            new ArgumentNullException(nameof(eventProductsManagementService));
    }

    // GET: v3/events/1001/products/203/variants
    [HttpGet]
    [AllowAnonymous]
    public async Task<ProductVariantDto[]> List(int eventId, int productId, CancellationToken token)
    {
        var product = await GetProductAsync(eventId, productId, token: token);

        return product.ProductVariants?
            .Where(v => !v.Archived)
            .OrderBy(v => v.Name)
            .Select(v => new ProductVariantDto(v))
            .ToArray() ?? Array.Empty<ProductVariantDto>();
    }

    // POST: v3/events/1001/products/203/variants
    [HttpPost]
    public async Task<IActionResult> Add(int eventId, int productId, NewProductVariantDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState.FormatErrors());
        }

        var product = await GetProductAsync(eventId, productId);

        var productVariant = dto.ToVariant();
        productVariant.ProductId = productId;
        product.ProductVariants.Add(productVariant);

        await _eventProductsManagementService.UpdateProductAsync(product);

        return Ok(new ProductVariantDto(productVariant));
    }

    // DELETE: v3/events/1001/products/203/variants/99
    [HttpDelete("{id}")]
    public async Task Archive(int eventId, int productId, int id)
    {
        var product = await GetProductAsync(eventId, productId);

        var variant = product.ProductVariants
                          .FirstOrDefault(v => v.ProductVariantId == id)
                      ?? throw new NotFoundException($"Product variant {id} not found.");

        variant.Archived = true;

        await _eventProductsManagementService.UpdateProductAsync(product);
    }

    private async Task<Product> GetProductAsync(int eventId, int productId, bool forUpdate = false,
        CancellationToken token = default)
    {
        var eventInfo = await _eventInfoRetrievalService.GetEventInfoByIdAsync(eventId,
            new EventInfoRetrievalOptions { ForUpdate = forUpdate, LoadProducts = true }, token);

        return eventInfo.Products
                   .FirstOrDefault(p => p.ProductId == productId)
               ?? throw new NotFoundException($"Product {productId} not found for event {eventId}");
    }
}
