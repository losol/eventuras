using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Services.Orders;
using Eventuras.Services.Registrations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.Registrations
{
    [ApiVersion("3")]
    [Authorize("registrations:read")]
    [Route("v{version:apiVersion}/registrations/{id:int}/orders")]
    [ApiController]
    public class RegistrationOrdersController : ControllerBase
    {
        private readonly IRegistrationRetrievalService _registrationRetrievalService;
        private readonly IOrderManagementService _orderManagementService;

        public RegistrationOrdersController(
            IRegistrationRetrievalService registrationRetrievalService,
            IOrderManagementService orderManagementService)
        {
            _registrationRetrievalService = registrationRetrievalService ?? throw
                new ArgumentNullException(nameof(registrationRetrievalService));

            _orderManagementService = orderManagementService ?? throw
                new ArgumentNullException(nameof(orderManagementService));
        }

        // GET: v3/registrations/667/orders
        [HttpGet]
        public async Task<RegistrationOrderDto[]> GetOrdersForRegistration(int id, CancellationToken token)
        {
            var r = await _registrationRetrievalService.GetRegistrationByIdAsync(id,
                new RegistrationRetrievalOptions
                {
                    LoadOrders = true,
                    LoadProducts = true
                }, token);

            return r.Orders
                .Select(o => new RegistrationOrderDto(o))
                .ToArray();
        }

        // POST: v3/registrations/667/orders
        [HttpPost]
        public async Task<IActionResult> CreateNewOrderForRegistration(int id,
            [FromBody] NewRegistrationOrderDto dto,
            CancellationToken cancellationToken)
        {
            var order = await _orderManagementService.CreateOrderForRegistrationAsync(id, dto.Items, cancellationToken);

            return Ok(new RegistrationOrderDto(order));
        }
    }
}
