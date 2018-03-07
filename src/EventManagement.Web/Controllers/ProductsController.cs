using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Domain;
using losol.EventManagement.Services;
using Microsoft.AspNetCore.Mvc;

namespace losol.EventManagement.Web.Controllers
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
	}
}
