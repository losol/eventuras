using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using losol.EventManagement.Services;
using System.ComponentModel.DataAnnotations;
using static losol.EventManagement.Domain.Order;

namespace losol.EventManagement.Web.Controllers.Api
{
	[Authorize(Policy = "AdministratorRole")]
	[Route("/api/v0/orders")]
	public class OrdersController : Controller
	{
		private readonly IOrderService _orderService;

		public OrdersController(IOrderService orderService)
		{
			_orderService = orderService;
		}

		[HttpPost("update/{id}")]
		public async Task<ActionResult> UpdateOrder([FromRoute]int id, [FromBody]UpdateOrderDetailsVM vm)
		{
			if (!ModelState.IsValid) return BadRequest();
			try
			{
				await _orderService.UpdateOrderDetailsAsync(id, 
				                                            vm.CustomerName, 
				                                            vm.CustomerEmail, 
				                                            vm.InvoiceReference, 
				                                            vm.Comments);
			}
			catch (ArgumentException)
			{
				return BadRequest();
			}
			return Ok();
		}

		[HttpPost("update/{id}/{status}")]
		public async Task<ActionResult> UpdateOrderStatus([FromRoute]int id, [FromRoute]OrderStatus status)
		{
			if(status == OrderStatus.Draft) return BadRequest();
			try{
				switch(status)
				{
					case OrderStatus.Verified: await _orderService.MarkAsVerifiedAsync(id);
						break;
					case OrderStatus.Invoiced: await _orderService.MarkAsInvoicedAsync(id);
						break;
					case OrderStatus.Cancelled: await _orderService.MarkAsCancelledAsync(id);
						break;
				}
				return Ok();
			}
			catch(Exception e) when (e is InvalidOperationException || e is ArgumentException) {
				return BadRequest();
			}
		}

		[HttpPost("update/{id}/make-free")]
		public async Task<ActionResult> MakeOrderFree([FromRoute]int id)
		{
			await _orderService.MakeOrderFreeAsync(id);
			return Ok();
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

		[HttpPost("line/add")]
		public async Task<IActionResult> AddOrderLine([FromBody]OrderLineVM vm) 
		{
			if (!ModelState.IsValid) return BadRequest();
			try
			{
				await _orderService.AddOrderLineAsync(vm.OrderId, vm.ProductId, vm.VariantId);
			}
			catch(ArgumentException)
			{
				return BadRequest();
			}
			return Ok();
		}

		[HttpPost("line/update/{lineId}")]
		public async Task<IActionResult> UpdateOrderLine([FromRoute]int lineId, [FromBody] OrderLineUpdateVM vm)
		{
			if (!ModelState.IsValid) return BadRequest();
			try 
			{
				await _orderService.UpdateOrderLine(lineId, vm.Quantity, vm.Price);	
			}
			catch(ArgumentException)
			{
				return BadRequest();
			}
			return Ok();
		}

		public class UpdateOrderDetailsVM
		{
			public string CustomerName { get; set; }
			[DataType(DataType.EmailAddress)]
			public string CustomerEmail { get; set; }
			public string InvoiceReference { get; set; }
			public string Comments { get; set; }
		}

		public class OrderLineVM
		{
			public int OrderId { get; set; }
			public int ProductId { get; set; }
			public int? VariantId { get; set; }
		}

		public class OrderLineUpdateVM
		{
			public int Quantity { get; set; }
			public decimal Price { get; set; }
		}
	}
}
