
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.Web.Api.Controllers
{
    [ApiVersion("0")]
    [Route("api/v0/products")]
    public class ProductsController : Controller
    {
        private readonly IProductsService _productsService;

        public ProductsController(IProductsService productsService)
        {
            _productsService = productsService;
        }

        [HttpGet, Route("for-event/{eventId}")]
        public async Task<IActionResult> GetForEvent(int eventId)
        {
            var products = await _productsService.GetProductsForEventAsync(eventId);
            return Ok(getResult(products));
        }

        private object getResult(List<Product> products)
        {
            return products.Select(s => new
            {
                s.ProductId,
                s.Name,
                s.Description,
                s.MoreInformation,
                s.EventInfoId,
                s.IsMandatory,
                s.MinimumQuantity,
                s.Inventory,
                s.Price,
                Variants = s.ProductVariants.Select(v => new
                {
                    v.ProductVariantId,
                    v.Name,
                    v.Description,
                    v.AdminOnly,
                    v.Price,
                    v.VatPercent
                })
            });
        }

        [HttpPost("{id}/published/{publish}")]
        public async Task<IActionResult> UpdateProductPublishedStatus([FromRoute] int id, [FromRoute] bool publish)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            var result = await _productsService.UpdateProductAsync(id, publish);
            return Ok();
        }

        [HttpPost("variant/{id}/published/{publish}")]
        public async Task<IActionResult> UpdateProductVariantPublishedStatus([FromRoute] int id, [FromRoute] bool publish)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            var result = await _productsService.UpdateProductVariantAsync(id, publish);
            return Ok();
        }

        [HttpPost("add-user")]
        public async Task<IActionResult> AddUserToProduct([FromBody] AddUserToProductVM vm,
            [FromServices] IRegistrationService registrationService)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            try
            {
                await registrationService.CreateOrUpdateOrder(vm.RegistrationId, vm.ProductId, vm.ProductVariantId);
            }
            catch (InvalidOperationException)
            {
                return StatusCode(StatusCodes.Status409Conflict);
            }
            catch (ArgumentException)
            {
                return BadRequest();
            }
            return Ok();
        }

        public class AddUserToProductVM
        {
            public int RegistrationId { get; set; }
            public int ProductId { get; set; }
            public int? ProductVariantId { get; set; }
        }
    }
}