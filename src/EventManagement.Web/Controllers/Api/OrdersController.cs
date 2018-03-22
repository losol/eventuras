using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using losol.EventManagement.Services;

namespace losol.EventManagement.Web.Controllers.Api
{
	[Authorize]
	[Route("/api/v0/orders")]
	public class OrdersController : Controller
	{
		private readonly IOrderService _orderService;

		public OrdersController(IOrderService orderService)
		{
			_orderService = orderService;
		}

		[HttpPost("line/delete/{lineid}")]
		public async Task<IActionResult> DeleteOrderLine(int lineid)
		{
			var line = await _orderService.GetOrderLineAsync(lineid);

			if(line == null)
			{
				return NotFound();
			}

			if(!line.Order.CanEdit)
			{
				return BadRequest();
			}

			return await _orderService.DeleteOrderLineAsync(lineid) ? 
				                      Ok() : StatusCode(StatusCodes.Status500InternalServerError);
		}
	}
}
