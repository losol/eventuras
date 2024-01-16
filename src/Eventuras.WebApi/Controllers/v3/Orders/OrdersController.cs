using Asp.Versioning;
using Eventuras.Services.Orders;
using Eventuras.WebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.WebApi.Controllers.v3.Orders
{
    [ApiVersion("3")]
    [Authorize]
    [Route("v{version:apiVersion}/orders")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderRetrievalService _orderRetrievalService;
        private readonly IOrderManagementService _orderManagementService;

        public OrdersController(
            IOrderRetrievalService orderRetrievalService,
            IOrderManagementService orderManagementService)
        {
            _orderRetrievalService = orderRetrievalService;
            _orderManagementService = orderManagementService;
        }

        [HttpGet("{id:int}")]
        public async Task<OrderDto> GetOrderById(int id, [FromQuery] OrderRequestDto request, CancellationToken cancellationToken = default)
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
        public async Task<IActionResult> ListAccessibleOrders([FromQuery] OrdersQueryDto query, CancellationToken cancellationToken = default)
        {
            var paging = await _orderRetrievalService.ListOrdersAsync(new OrderListRequest
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
        public async Task<IActionResult> CreateOrUpdateOrder([FromBody] NewOrderRequestDto request, CancellationToken cancellationToken = default)
        {
            var order = await _orderManagementService.CreateOrderForRegistrationAsync(
                request.RegistrationId,
                request.Lines,
                cancellationToken);

            return Ok(new OrderDto(order));
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateOrder(int id, [FromBody] OrderUpdateRequestDto request, CancellationToken cancellationToken = default)
        {
            var order = await _orderRetrievalService
                .GetOrderByIdAsync(id,
                    new OrderRetrievalOptions
                    {
                        IncludeRegistration = true,
                        IncludeUser = true,
                        IncludeOrderLines = true
                    },
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
}