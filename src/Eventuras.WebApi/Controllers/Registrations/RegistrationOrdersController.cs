using System;
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
            [FromBody] RegistrationOrderDto dto,
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
}