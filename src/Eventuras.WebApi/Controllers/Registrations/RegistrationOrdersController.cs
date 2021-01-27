using Eventuras.Services.Registrations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.WebApi.Controllers.Orders;

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

        [HttpPost]
        public async Task<ActionResult<OrderDto>> CreateNewOrderForRegistration(int id,
            [FromBody] RegistrationOrderDto dto,
            CancellationToken cancellationToken)
        {
            var registration = await _registrationRetrievalService
                .GetRegistrationByIdAsync(id, cancellationToken: cancellationToken);

            var order = await _registrationOrderManagementService
                .CreateOrderForRegistrationAsync(registration, dto.Items
                        .Select(d => d.ToOrderItemDto())
                        .ToArray(), cancellationToken);

            return Ok(new OrderDto(order));
        }
    }
}
