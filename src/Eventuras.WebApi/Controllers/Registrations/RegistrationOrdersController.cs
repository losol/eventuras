#nullable enable

using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Services.Orders;
using Eventuras.Services.Registrations;
using Eventuras.WebApi.Controllers.Orders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.Registrations
{
    [ApiVersion("3")]
    [Authorize("registrations:read")]
    [Route("v{version:apiVersion}/registrations/{id:int}")]
    [ApiController]
    public class RegistrationOrdersController : ControllerBase
    {
        private readonly IRegistrationRetrievalService _registrationRetrievalService;
        private readonly IOrderManagementService _orderManagementService;

        public RegistrationOrdersController(
            IRegistrationRetrievalService registrationRetrievalService,
            IOrderManagementService orderManagementService)
        {
            _registrationRetrievalService = registrationRetrievalService;
            _orderManagementService = orderManagementService;
        }

        // GET: v3/registrations/667/orders
        [HttpGet("orders")]
        public async Task<IEnumerable<OrderDto>> GetOrdersForRegistration(int id, CancellationToken cancellationToken = default)
        {
            var r = await _registrationRetrievalService.GetRegistrationByIdAsync(id,
                new RegistrationRetrievalOptions
                {
                    LoadOrders = true,
                    LoadProducts = true
                },
                cancellationToken);

            return r.Orders.Select(o => new OrderDto(o)).ToArray();
        }

        // POST: v3/registrations/667/orders
        [HttpPost("orders")]
        public async Task<IActionResult> CreateNewOrderForRegistration(
            int id,
            [FromBody] NewRegistrationOrderDto dto,
            CancellationToken cancellationToken = default)
        {
            _ = await _registrationRetrievalService.GetRegistrationByIdAsync(id,
                new RegistrationRetrievalOptions(),
                cancellationToken); // check if registration exists

            var order = await _orderManagementService.CreateOrderForRegistrationAsync(id, dto.Items, cancellationToken);

            return CreatedAtAction(nameof(OrdersController.GetOrderById), "Orders", new { id = order.OrderId }, new OrderDto(order));
        }
    }
}