using Eventuras.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using static Eventuras.Domain.Order;
using static Eventuras.Domain.PaymentMethod;

namespace Eventuras.Web.Controllers.Api.V0
{
    [ApiVersion("0")]
    [Authorize(Policy = AuthPolicies.AdministratorRole)]
    [Route("/api/v0/orders")]
    public class OrdersController : Controller
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost("{id}/update/ordercomment")]
        public async Task<ActionResult> UpdateOrderComment([FromRoute] int id, [FromBody] UpdateOrderDetailsVM vm)
        {
            if (!ModelState.IsValid) return BadRequest();
            try
            {
                await _orderService.UpdateOrderComment(id, vm.Comments);
            }
            catch (ArgumentException)
            {
                return BadRequest();
            }
            return Ok();
        }

        [HttpGet("for-registration/{registrationId}")]
        public async Task<IActionResult> GetProductIdsForRegistration([FromRoute] int registrationId,
            [FromServices] IRegistrationService registrationService)
        {
            var orders = (await registrationService.GetWithOrdersAsync(registrationId))
                .Orders
                .SelectMany(o => o.OrderLines)
                .Select(ol => ol.ProductId);
            return Ok(orders);
        }

        [HttpPost("update/{id}/{status}")]
        public async Task<ActionResult> UpdateOrderStatus([FromRoute] int id, [FromRoute] OrderStatus status)
        {
            try
            {
                switch (status)
                {
                    case OrderStatus.Verified:
                        await _orderService.MarkAsVerifiedAsync(id);
                        break;
                    case OrderStatus.Invoiced:
                        await _orderService.CreateInvoiceAsync(id);
                        break;
                    case OrderStatus.Cancelled:
                        await _orderService.MarkAsCancelledAsync(id);
                        break;
                }
                return Ok();
            }
            catch (Exception e)
            {
                await _orderService.AddLogLineAsync(id, e.Message);
                return BadRequest();
            }
        }

        [HttpPost("{id}/paymentmethod/update/{paymentmethod}")]
        public async Task<ActionResult> SetPaymentMethod([FromRoute] int id, [FromRoute] PaymentProvider paymentmethod)
        {
            if (!ModelState.IsValid) return BadRequest();
            try
            {
                await _orderService.UpdatePaymentMethod(
                    id,
                    paymentmethod);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            return Ok();
        }

        [HttpPost("update/{id}/make-free")]
        public async Task<ActionResult> MakeOrderFree([FromRoute] int id)
        {
            await _orderService.MakeOrderFreeAsync(id);
            return Ok();
        }

        [HttpPost("reopen/{id}")]
        public async Task<ActionResult> Reopen([FromRoute] int id)
        {
            try
            {
                var order = await _orderService.CreateDraftFromCancelledOrder(id);
                return Ok(order.OrderId);
            }
            catch (InvalidOperationException)
            {
                return StatusCode(StatusCodes.Status409Conflict);
            }
        }

        [HttpPost("line/delete/{lineid}")]
        public async Task<IActionResult> DeleteOrderLine(int lineid)
        {
            var line = await _orderService.GetOrderLineAsync(lineid);

            if (line == null)
            {
                return NotFound();
            }

            if (!line.Order.CanEdit)
            {
                return BadRequest();
            }

            return await _orderService.DeleteOrderLineAsync(lineid) ?
                                      Ok() : StatusCode(StatusCodes.Status500InternalServerError);
        }

        [HttpPost("line/add")]
        public async Task<IActionResult> AddOrderLine([FromBody] OrderLineVM vm)
        {
            if (!ModelState.IsValid) return BadRequest();
            try
            {
                await _orderService.AddOrderLineAsync(vm.OrderId, vm.ProductId, vm.VariantId);
            }
            catch (ArgumentException)
            {
                return BadRequest();
            }
            return Ok();
        }

        [HttpPost("line/update/{lineId}")]
        public async Task<IActionResult> UpdateOrderLine([FromRoute] int lineId, [FromBody] OrderLineUpdateVM vm)
        {
            if (!ModelState.IsValid) return BadRequest();
            try
            {
                await _orderService.UpdateOrderLine(lineId, vm.VariantId, vm.Quantity, vm.Price);
            }
            catch (ArgumentException)
            {
                return BadRequest();
            }
            return Ok();
        }

        [HttpPost("delete/{id}")]
        public async Task<IActionResult> DeleteOrder([FromRoute] int id)
        {
            await _orderService.DeleteOrderAsync(id);
            return Ok();
        }


        [HttpPost("create-order")]
        [HttpPost("update-order")]
        public async Task<IActionResult> Update([FromBody] UpdateOrderVM vm,
            [FromServices] IRegistrationService registrationService)
        {
            if (!ModelState.IsValid) return BadRequest();

            try
            {
                await registrationService.CreateOrUpdateOrder(
                    registrationId: vm.RegistrationId,
                    ordersVm: vm.Products
                            .Select(o => new OrderVM
                            {
                                ProductId = o.Id,
                                VariantId = o.VariantId,
                                Quantity = o.Quantity
                            }).ToList()
                );
                return Ok();
            }
            catch (ArgumentException)
            {
                return BadRequest();
            }
            catch (InvalidOperationException)
            {
                return StatusCode(StatusCodes.Status409Conflict);
            }
            catch
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }


        public class CreateOrderVM
        {
            public int RegistrationId { get; set; }
            public int[] ProductIds { get; set; }
            public int[] VariantIds { get; set; }
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
            public int? VariantId { get; set; }
        }

        public class UpdateOrderVM
        {
            public List<ProductVM> Products { get; set; } = new List<ProductVM>();
            public int RegistrationId { get; set; }
        }

        public class ProductVM
        {
            public int Id { get; set; }
            public int Quantity { get; set; }
            public int? VariantId { get; set; }
        }
    }
}
