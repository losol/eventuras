using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Domain;
using Eventuras.Services.Events;
using Eventuras.Services.Events.Products;
using Eventuras.Services.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Eventuras.WebApi.Controllers.v3.Events.Products;

[ApiVersion("3")]
[Authorize(Policy = Constants.Auth.AdministratorRole)]
[Route("v{version:apiVersion}/events/{eventId}/products")]
[ApiController]
public class EventProductsController : ControllerBase
{
    private readonly IEventInfoAccessControlService _eventInfoAccessControlService;
    private readonly IEventInfoRetrievalService _eventInfoRetrievalService;
    private readonly IEventProductsManagementService _eventProductsManagementService;
    private readonly ILogger<EventProductsController> _logger;
    private readonly IProductRetrievalService _productRetrievalService;

    public EventProductsController(
        IProductRetrievalService productRetrievalService,
        IEventInfoRetrievalService eventInfoRetrievalService,
        IEventProductsManagementService eventProductsManagementService,
        IEventInfoAccessControlService eventInfoAccessControlService,
        ILogger<EventProductsController> logger)
    {
        _productRetrievalService = productRetrievalService ?? throw
            new ArgumentNullException(nameof(productRetrievalService));

        _eventInfoRetrievalService = eventInfoRetrievalService ?? throw
            new ArgumentNullException(nameof(eventInfoRetrievalService));

        _eventProductsManagementService = eventProductsManagementService ?? throw
            new ArgumentNullException(nameof(eventProductsManagementService));

        _eventInfoAccessControlService = eventInfoAccessControlService ?? throw
            new ArgumentNullException(nameof(eventInfoAccessControlService));

        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    // GET v3/events/1/products
    [HttpGet]
    [AllowAnonymous]
    public async Task<ProductDto[]> List(int eventId, [FromQuery] EventProductsQueryDto query,
        CancellationToken token)
    {
        var eventInfo = await _eventInfoRetrievalService.GetEventInfoByIdAsync(eventId, token);
        await _eventInfoAccessControlService.CheckEventReadAccessAsync(eventInfo, token);

        var products = await _productRetrievalService
            .ListProductsAsync(new ProductListRequest(eventId) { Filter = query.ToProductFilter() },
                new ProductRetrievalOptions { LoadVariants = true }, token);

        return products
            .Select(p => new ProductDto(p))
            .ToArray();
    }

    // POST v3/events/1/products
    [HttpPost]
    public async Task<IActionResult> Add(int eventId, [FromBody] NewProductDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState.FormatErrors());
        }

        var product = dto.ToProduct();
        product.EventInfoId = eventId;

        await _eventProductsManagementService
            .AddProductAsync(product);

        return Ok(new ProductDto(product));
    }

    // PUT v3/events/1/products/1001
    [HttpPut("{productId}")]
    public async Task<IActionResult> Update(int eventId, int productId, [FromBody] ProductFormDto dto)
    {
        _logger.LogInformation("Updating product {productId} for event {eventId}", productId, eventId);
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state: {errors}", ModelState.FormatErrors());
            return BadRequest(ModelState.FormatErrors());
        }

        var product = await GetProductAsync(eventId, productId);

        if (product == null)
        {
            return NotFound();
        }

        dto.CopyTo(product);

        await _eventProductsManagementService.UpdateProductAsync(product);

        return Ok(new ProductDto(product));
    }

    // DELETE v3/events/1/products/23
    [HttpDelete("{productId}")]
    public async Task Archive(int eventId, int productId)
    {
        var product = await GetProductAsync(eventId, productId);
        await _eventProductsManagementService.ArchiveProductAsync(product);
    }

    private async Task<Product> GetProductAsync(int eventId, int productId)
    {
        var product =
            await _productRetrievalService.GetProductByIdAsync(productId,
                new ProductRetrievalOptions { LoadVariants = true });

        if (product.EventInfoId != eventId)
        {
            throw new NotFoundException($"Product {productId} is not found for event {eventId}");
        }

        return product;
    }
}
