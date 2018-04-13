
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Domain;
using losol.EventManagement.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace losol.EventManagement.Web.Api.Controllers
{
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
			var products = await _productsService.GetForEventAsync(eventId);
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
				s.MandatoryCount,
				s.MaxAttendees,
				s.Price,
				Variants = s.ProductVariants.Select(v => new {
					v.ProductVariantId,
					v.Name,
					v.Description,
					v.AdminOnly,
					v.Price,
					v.VatPercent
				})
			});
		}

		[HttpPost("add-user")]
		public async Task<IActionResult> AddUserToProduct([FromBody]AddUserToProductVM vm,
			[FromServices]IRegistrationService registrationService)
		{
			if(!ModelState.IsValid)
			{
				return BadRequest();
			}
			try{
				await registrationService.AddProductToRegistration(vm.Email, vm.EventId, vm.ProductId, vm.VariantId);
			}
			catch(InvalidOperationException)
			{
				return StatusCode(StatusCodes.Status409Conflict);
			}
			catch(ArgumentException)
			{
				return BadRequest();
			}
			return Ok();
		}

		public class AddUserToProductVM
		{
			public int EventId { get; set; }
			public string Email { get; set; }
			public int ProductId { get; set; }
			public int? VariantId { get; set; }
		}
	}
}