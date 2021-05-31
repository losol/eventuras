using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Services.Events;
using Eventuras.Services.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.Events
{
    [ApiVersion("3")]
    [Authorize(Policy = Constants.Auth.AdministratorRole)]
    [Route("v{version:apiVersion}/events/{eventId}/products")]
    [ApiController]
    public class EventProductsController : ControllerBase
    {
        private readonly IEventInfoRetrievalService _eventInfoRetrievalService;
        private readonly IEventProductsManagementService _eventProductsManagementService;
        private readonly IEventInfoAccessControlService _eventInfoAccessControlService;

        public EventProductsController(
            IEventInfoRetrievalService eventInfoRetrievalService,
            IEventProductsManagementService eventProductsManagementService,
            IEventInfoAccessControlService eventInfoAccessControlService)
        {
            _eventInfoRetrievalService = eventInfoRetrievalService ?? throw
                new ArgumentNullException(nameof(eventInfoRetrievalService));

            _eventProductsManagementService = eventProductsManagementService ?? throw
                new ArgumentNullException(nameof(eventProductsManagementService));

            _eventInfoAccessControlService = eventInfoAccessControlService ?? throw
                new ArgumentNullException(nameof(eventInfoAccessControlService));
        }

        // GET v3/events/1/products
        [HttpGet]
        [AllowAnonymous]
        public async Task<ProductDto[]> List(int eventId, CancellationToken token)
        {
            await _eventInfoAccessControlService.CheckEventReadAccessAsync(eventId, token);

            var eventInfo = await _eventInfoRetrievalService
                .GetEventInfoByIdAsync(eventId,
                    new EventInfoRetrievalOptions
                    {
                        LoadProducts = true
                    }, token);

            return eventInfo.Products
                .Where(p => !p.Archived)
                .Select(p => new ProductDto(p))
                .ToArray();
        }

        // POST v3/events/1/products
        [HttpPost]
        public async Task<IActionResult> Add(int eventId, [FromBody] NewProductDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            var product = dto.ToProduct();
            product.EventInfoId = eventId;

            await _eventProductsManagementService
                .AddProductAsync(product);

            return Ok(new ProductDto(product));
        }

        // DELETE v3/events/1/products/23
        [HttpDelete("{productId}")]
        public async Task Archive(int eventId, int productId)
        {
            var eventInfo = await _eventInfoRetrievalService
                .GetEventInfoByIdAsync(eventId,
                    new EventInfoRetrievalOptions
                    {
                        LoadProducts = true
                    });

            var product = eventInfo.Products
                              .FirstOrDefault(p => p.ProductId == productId)
                          ?? throw new NotFoundException($"Product {productId} is not found for event {eventId}");

            await _eventProductsManagementService.ArchiveProductAsync(product);
        }
    }
}