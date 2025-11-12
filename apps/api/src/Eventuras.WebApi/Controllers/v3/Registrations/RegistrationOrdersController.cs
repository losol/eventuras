#nullable enable

using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Services.Orders;
using Eventuras.Services.Registrations;
using Eventuras.WebApi.Controllers.v3.Orders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.v3.Registrations;

[ApiVersion("3")]
[Authorize]
[Route("v{version:apiVersion}/registrations/{id:int}")]
[ApiController]
public class RegistrationOrdersController : ControllerBase
{
    private readonly IOrderManagementService _orderManagementService;
    private readonly IRegistrationRetrievalService _registrationRetrievalService;

    public RegistrationOrdersController(
        IRegistrationRetrievalService registrationRetrievalService,
        IOrderManagementService orderManagementService)
    {
        _registrationRetrievalService = registrationRetrievalService;
        _orderManagementService = orderManagementService;
    }

    // GET: v3/registrations/667/orders
    [HttpGet("orders")]
    public async Task<IEnumerable<OrderDto>> GetOrdersForRegistration(int id,
        CancellationToken cancellationToken = default)
    {
        var r = await _registrationRetrievalService.GetRegistrationByIdAsync(id,
            new RegistrationRetrievalOptions { LoadOrders = true, LoadProducts = true },
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
            cancellationToken); // check if registration exists, will throw NotFoundException if not

        var order = await _orderManagementService.CreateOrderForRegistrationAsync(id, dto.Items, cancellationToken);

        return CreatedAtAction(nameof(OrdersController.GetOrderById), "Orders", new { id = order.OrderId },
            new OrderDto(order));
    }

    // POST: v3/registrations/667/products
    [HttpPost("products")]
    public async Task<IActionResult> AutoCreateOrUpdateOrderForRegistration(
        int id,
        [FromBody] OrderUpdateRequestDto dto,
        CancellationToken cancellationToken = default)
    {
        // Check if registration exists, will throw NotFoundException if not
        _ = await _registrationRetrievalService.GetRegistrationByIdAsync(id,
            new RegistrationRetrievalOptions(),
            cancellationToken);

        // Create or update orders to get expected products
        _ = await _orderManagementService.AutoCreateOrUpdateOrder(id, dto.Lines, cancellationToken);

        return Ok();
    }
}
