using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Services;
using Eventuras.Services.Orders;
using Eventuras.Services.Registrations;
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
        private readonly IRegistrationRetrievalService _registrationRetrievalService;
        private readonly IRegistrationAccessControlService _registrationAccessControlService;
        private readonly IRegistrationService _registrationService;

        public OrdersController(
            IOrderRetrievalService orderRetrievalService,
            IOrderManagementService orderManagementService,
            IRegistrationRetrievalService registrationRetrievalService,
            IRegistrationAccessControlService registrationAccessControlService,
            IRegistrationService registrationService)
        {
            _orderRetrievalService = orderRetrievalService ?? throw
                new ArgumentNullException(nameof(orderRetrievalService));

            _orderManagementService = orderManagementService ?? throw
                new ArgumentNullException(nameof(orderManagementService));

            _registrationAccessControlService = registrationAccessControlService ?? throw
                new ArgumentNullException(nameof(registrationAccessControlService));

            _registrationService = registrationService ?? throw
                new ArgumentNullException(nameof(registrationService));

            _registrationRetrievalService = registrationRetrievalService ?? throw
                new ArgumentNullException(nameof(registrationRetrievalService));
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

        [HttpPost]
        public async Task<IActionResult> CreateOrUpdateOrder([FromBody] NewOrderRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState.FormatErrors());
            }

            try
            {
                var registration = await _registrationRetrievalService
                    .GetRegistrationByIdAsync(request.RegistrationId);

                await _registrationAccessControlService
                    .CheckRegistrationUpdateAccessAsync(registration);

                // FIXME: calling obsolete API here
                // the obsolete API is hard to maintain, and is not covered with tests...
                // TODO: get into the legacy logic maybe and refactor it! 
                var order = await _registrationService.CreateOrUpdateOrder(
                    request.RegistrationId,
                    request.Lines.Select(l => new OrderVM
                    {
                        ProductId = l.ProductId,
                        VariantId = l.ProductVariantId,
                        Quantity = l.Quantity
                    }).ToList());

                return Ok(new OrderDto(order));
            }
            catch (OrderUpdateException e)
            {
                return BadRequest(e.Message);
            }
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

    public class OrderLineUpdateDto
    {
        public int ProductId { get; set; }

        public int? ProductVariantId { get; set; }

        public int Quantity { get; set; }
    }

    public class OrderUpdateRequestDto
    {
        [Required] public OrderLineUpdateDto[] Lines { get; set; }

        public OrderUpdates ToOrderUpdates()
        {
            var updates = new OrderUpdates();
            foreach (var item in Lines)
            {
                var productUpdateBuilder = updates.AddProduct(item.ProductId, item.Quantity);
                if (item.ProductVariantId.HasValue)
                {
                    productUpdateBuilder.WithVariant(item.ProductVariantId.Value);
                }
            }

            return updates;
        }
    }

    public class NewOrderRequestDto : OrderUpdateRequestDto
    {
        [Required] public int RegistrationId { get; set; }
    }
}
