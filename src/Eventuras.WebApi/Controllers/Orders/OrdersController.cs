using System;
using System.Threading.Tasks;
using Eventuras.Services.Orders;
using Eventuras.WebApi.Controllers.Registrations;
using Eventuras.WebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.Orders
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
            _orderRetrievalService = orderRetrievalService ?? throw
                new ArgumentNullException(nameof(orderRetrievalService));

            _orderManagementService = orderManagementService ?? throw
                new ArgumentNullException(nameof(orderManagementService));
        }

        [HttpGet("{id}")]
        public async Task<OrderDto> GetOrderById(int id, [FromQuery] OrderRequestDto request)
        {
            var order = await _orderRetrievalService.GetOrderByIdAsync(id, new OrderRetrievalOptions
            {
                IncludeUser = request.IncludeUser,
                IncludeRegistration = request.IncludeRegistration
            });

            return new OrderDto(order);
        }

        [HttpGet]
        public async Task<IActionResult> ListAccessibleOrders([FromQuery] OrdersQueryDto query)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState.FormatErrors());
            }

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
                    AccessibleOnly = true
                }
            }, new OrderRetrievalOptions
            {
                IncludeUser = query.IncludeUser,
                IncludeRegistration = query.IncludeRegistration,
                IncludeOrderLines = true
            });

            return Ok(PageResponseDto<RegistrationOrderDto>.FromPaging(
                query, paging, o => new OrderDto(o)));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrder(int id, [FromBody] OrderUpdateRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState.FormatErrors());
            }

            var order = await _orderRetrievalService
                .GetOrderByIdAsync(id, new OrderRetrievalOptions
                {
                    IncludeRegistration = true,
                    IncludeUser = true,
                    IncludeOrderLines = true
                });

            try
            {
                await _orderManagementService.UpdateOrderAsync(order, request.ToOrderUpdates());
                return Ok(new OrderDto(order));
            }
            catch (OrderUpdateException e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task CancelOrder(int id)
        {
            var order = await _orderRetrievalService.GetOrderByIdAsync(id);
            await _orderManagementService.CancelOrderAsync(order);
        }
    }
}
