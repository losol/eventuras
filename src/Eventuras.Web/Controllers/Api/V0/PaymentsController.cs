using System.Threading.Tasks;
using Eventuras.Services.Invoicing;
using Eventuras.Services;
using Eventuras.Services.Orders;
using Eventuras.Services.Stripe;
using Microsoft.AspNetCore.Mvc;
using Stripe;

namespace Eventuras.Web.Controllers.Api
{
    [ApiVersion("0")]
    [Route("api/payments")]
    public class PaymentsController : Controller
    {
        private readonly IOrderService _orderService;
        public PaymentsController(IOrderService service)
        {
            _orderService = service;
        }

        [HttpPost("stripe")]
        public async Task<IActionResult> StripeCharge([FromBody] StripeChargeRequestVM request,
            [FromServices] StripeInvoiceProvider provider)
        {
            await provider.ChargeCustomer(
                order: await _orderService.GetByIdAsync(request.OrderId),
                token: request.Token);
            // TODO: Mark the order as paid
            return Ok();
        }
    }

    public class StripeChargeRequestVM
    {
        public int OrderId { get; set; }
        public StripeToken Token { get; set; }
    }
}
