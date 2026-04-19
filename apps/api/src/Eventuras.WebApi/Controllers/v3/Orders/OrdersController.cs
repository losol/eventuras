using System;
using System.Threading;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Domain;
using Eventuras.Services.BusinessEvents;
using Eventuras.Services.Orders;
using Eventuras.Services.Registrations;
using Eventuras.WebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.v3.Orders;

[ApiVersion("3")]
[Authorize]
[Route("v{version:apiVersion}/orders")]
[ApiController]
public class OrdersController : ControllerBase
{
    private readonly IBusinessEventService _businessEventService;
    private readonly IOrderManagementService _orderManagementService;
    private readonly IOrderRetrievalService _orderRetrievalService;
    private readonly IRegistrationRetrievalService _registrationRetrievalService;

    public OrdersController(
        IOrderRetrievalService orderRetrievalService,
        IOrderManagementService orderManagementService,
        IBusinessEventService businessEventService,
        IRegistrationRetrievalService registrationRetrievalService)
    {
        _orderRetrievalService = orderRetrievalService ?? throw new ArgumentNullException(nameof(orderRetrievalService));
        _orderManagementService = orderManagementService ?? throw new ArgumentNullException(nameof(orderManagementService));
        _businessEventService = businessEventService ?? throw new ArgumentNullException(nameof(businessEventService));
        _registrationRetrievalService = registrationRetrievalService ?? throw new ArgumentNullException(nameof(registrationRetrievalService));
    }

    [HttpGet("{id:int}")]
    public async Task<OrderDto> GetOrderById(int id, [FromQuery] OrderRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var order = await _orderRetrievalService.GetOrderByIdAsync(id,
            new OrderRetrievalOptions
            {
                IncludeUser = request.IncludeUser,
                IncludeRegistration = request.IncludeRegistration,
                IncludeOrderLines = true
            },
            cancellationToken);

        return new OrderDto(order);
    }

    [HttpGet]
    public async Task<IActionResult> ListAccessibleOrders([FromQuery] OrdersQueryDto query,
        CancellationToken cancellationToken = default)
    {
        var paging = await _orderRetrievalService.ListOrdersAsync(
            new OrderListRequest
            {
                Limit = query.Limit,
                Offset = query.Offset,
                Filter = new OrderListFilter
                {
                    EventId = query.EventId,
                    UserId = query.UserId,
                    RegistrationId = query.RegistrationId,
                    Status = query.Status,
                    AccessibleOnly = true,
                    OrganizationId = query.OrganizationId
                }
            },
            new OrderRetrievalOptions
            {
                IncludeUser = query.IncludeUser,
                IncludeRegistration = query.IncludeRegistration,
                IncludeOrderLines = true
            },
            cancellationToken);

        return Ok(PageResponseDto<OrderDto>.FromPaging(
            query,
            paging,
            o => new OrderDto(o)));
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrUpdateOrder([FromBody] NewOrderRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var order = await _orderManagementService.CreateOrderForRegistrationAsync(
            request.RegistrationId,
            request.Lines,
            cancellationToken);

        return Ok(new OrderDto(order));
    }

    [HttpPatch("{id:int}")]
    [EndpointSummary("Partially update an order")]
    [EndpointDescription("Updates specific fields of an order. Only Status, Comments, and PaymentMethod can be modified.")]
    [ProducesResponseType(typeof(OrderDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> PatchOrder(
        int id,
        [FromBody] OrderPatchDto patchDto,
        CancellationToken cancellationToken = default)
    {
        var order = await _orderRetrievalService.GetOrderByIdAsync(id,
            new OrderRetrievalOptions { IncludeRegistration = true, IncludeUser = true, IncludeOrderLines = true },
            cancellationToken);

        if (order == null)
        {
            return NotFound("Order not found.");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var oldStatus = order.Status;

        try
        {
            patchDto.ApplyTo(order);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }

        if (order.Status != oldStatus)
        {
            // Tenant derived from the order's registration → event → organization
            var organizationUuid = await _registrationRetrievalService
                .GetOrganizationUuidAsync(order.RegistrationId, cancellationToken);

            _businessEventService.AddEvent(
                BusinessEventSubjects.ForOrder(order.Uuid),
                "order.status.changed",
                $"Status changed from {oldStatus} to {order.Status}",
                organizationUuid: organizationUuid);
        }

        await _orderManagementService.UpdateOrderAsync(order, cancellationToken);

        return Ok(new OrderDto(order));
    }


    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateOrder(int id, [FromBody] OrderUpdateRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var order = await _orderRetrievalService
            .GetOrderByIdAsync(id,
                new OrderRetrievalOptions { IncludeRegistration = true, IncludeUser = true, IncludeOrderLines = true },
                cancellationToken);

        await _orderManagementService.UpdateOrderLinesAsync(order, request.Lines, cancellationToken);
        return Ok(new OrderDto(order));
    }

    [HttpDelete("{id:int}")]
    public async Task CancelOrder(int id, CancellationToken cancellationToken = default)
    {
        var order = await _orderRetrievalService.GetOrderByIdAsync(id, cancellationToken: cancellationToken);
        await _orderManagementService.CancelOrderAsync(order, cancellationToken);
    }
}
