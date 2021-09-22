using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Events;
using Eventuras.Services.Events.Products;
using Eventuras.Services.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.Events.Products
{
    [ApiVersion("3")]
    [Authorize(Policy = Constants.Auth.AdministratorRole)]
    [Route("v{version:apiVersion}/events/{eventId}/products")]
    [ApiController]
    public class EventProductsController : ControllerBase
    {
        private readonly IProductRetrievalService _productRetrievalService;
        private readonly IEventProductsManagementService _eventProductsManagementService;
        private readonly IEventInfoAccessControlService _eventInfoAccessControlService;

        public EventProductsController(
            IProductRetrievalService productRetrievalService,
            IEventProductsManagementService eventProductsManagementService,
            IEventInfoAccessControlService eventInfoAccessControlService)
        {
            _productRetrievalService = productRetrievalService ?? throw
                new ArgumentNullException(nameof(productRetrievalService));

            _eventProductsManagementService = eventProductsManagementService ?? throw
                new ArgumentNullException(nameof(eventProductsManagementService));

            _eventInfoAccessControlService = eventInfoAccessControlService ?? throw
                new ArgumentNullException(nameof(eventInfoAccessControlService));
        }

        // GET v3/events/1/products
        [HttpGet]
        [AllowAnonymous]
        public async Task<ProductDto[]> List(int eventId, [FromQuery] EventProductsQueryDto query,
            CancellationToken token)
        {
            await _eventInfoAccessControlService.CheckEventReadAccessAsync(eventId, token);

            var products = await _productRetrievalService
                .ListProductsAsync(new ProductListRequest(eventId)
                {
                    Filter = query.ToProductFilter()
                }, new ProductRetrievalOptions
                {
                    LoadVariants = true
                }, token);

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
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState.FormatErrors());
            }

            var product = await GetProductAsync(eventId, productId);
            dto.ToProduct(product);

            await _eventProductsManagementService
                .UpdateProductAsync(product);

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
            var product = await _productRetrievalService.GetProductByIdAsync(productId, new ProductRetrievalOptions
            {
                LoadVariants = true
            });

            if (product.EventInfoId != eventId)
            {
                throw new NotFoundException($"Product {productId} is not found for event {eventId}");
            }

            return product;
        }
    }
}
