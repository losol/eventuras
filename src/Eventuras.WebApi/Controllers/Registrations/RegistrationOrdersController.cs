using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Services.Registrations;
using Eventuras.WebApi.Controllers.Orders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.Registrations
{
    [ApiVersion("3")]
    [Authorize("registrations:read")]
    [Route("v{version:apiVersion}/registrations/{id}/orders")]
    [ApiController]
    public class RegistrationOrdersController : ControllerBase
    {
        private readonly IRegistrationRetrievalService _registrationRetrievalService;
        private readonly IRegistrationOrderManagementService _registrationOrderManagementService;

        public RegistrationOrdersController(
            IRegistrationRetrievalService registrationRetrievalService,
            IRegistrationOrderManagementService registrationOrderManagementService)
        {
            _registrationRetrievalService = registrationRetrievalService ?? throw
                new ArgumentNullException(nameof(registrationRetrievalService));

            _registrationOrderManagementService = registrationOrderManagementService ?? throw
                new ArgumentNullException(nameof(registrationOrderManagementService));
        }

        // GET: v3/registrations/667/orders
        [HttpGet]
        public async Task<OrderDto[]> GetOrdersForRegistration(int id, CancellationToken token)
        {
            var r = await _registrationRetrievalService.GetRegistrationByIdAsync(id,
                new RegistrationRetrievalOptions
                {
                    IncludeOrders = true,
                    IncludeProducts = true
                }, token);

            return r.Orders
                .Select(o => new OrderDto(o))
                .ToArray();
        }

        // POST: v3/registrations/667/orders
        [HttpPost]
        public async Task<OrderDto> CreateNewOrderForRegistration(int id,
            [FromBody] NewRegistrationOrderDto dto,
            CancellationToken token)
        {
            var registration = await _registrationRetrievalService
                .GetRegistrationByIdAsync(id, cancellationToken: token);

            var order = await _registrationOrderManagementService
                .CreateOrderForRegistrationAsync(registration, dto.Items
                    .Select(d => d.ToOrderItemDto())
                    .ToArray(), token);

            return new OrderDto(order);
        }
    }

    public class NewRegistrationOrderDto
    {
        [Required] [MinLength(1)] public NewRegistrationOrderItemDto[] Items { get; set; }
    }

    public class NewRegistrationOrderItemDto
    {
        [Range(1, int.MaxValue)] public int ProductId { get; set; }

        [Range(1, int.MaxValue)] public int? ProductVariantId { get; set; }

        [Range(1, int.MaxValue)] public int Quantity { get; set; }

        public OrderItemDto ToOrderItemDto()
        {
            return new OrderItemDto
            {
                ProductId = ProductId,
                VariantId = ProductVariantId,
                Quantity = Quantity
            };
        }
    }
}
