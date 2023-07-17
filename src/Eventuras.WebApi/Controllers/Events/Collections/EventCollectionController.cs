using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Domain;
using Eventuras.Services.EventCollections;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.Events.Collections
{
    [ApiVersion("3")]
    [Authorize(Policy = Constants.Auth.AdministratorRole)]
    [Route("v{version:apiVersion}/events/collections")]
    [ApiController]
    public class EventCollectionController : ControllerBase
    {
        private readonly IEventCollectionManagementService _eventCollectionManagementService;
        private readonly IEventCollectionRetrievalService _eventCollectionRetrievalService;

        public EventCollectionController(
            IEventCollectionManagementService eventCollectionManagementService,
            IEventCollectionRetrievalService eventCollectionRetrievalService)
        {
            _eventCollectionManagementService = eventCollectionManagementService ?? throw
                new ArgumentNullException(nameof(eventCollectionManagementService));

            _eventCollectionRetrievalService = eventCollectionRetrievalService ?? throw
                new ArgumentNullException(nameof(eventCollectionRetrievalService));
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> List(CancellationToken cancellationToken)
        {
            var collections = await _eventCollectionRetrievalService
                .ListCollectionsAsync(cancellationToken: cancellationToken);

            return Ok(collections
                .Select(c => new EventCollectionDto(c))
                .ToArray());
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
        {
            var c = await _eventCollectionRetrievalService
                .GetCollectionByIdAsync(id, cancellationToken: cancellationToken);

            return Ok(new EventCollectionDto(c));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] EventCollectionDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState.FormatErrors());
            }

            var collection = new EventCollection();
            dto.CopyTo(collection);
            await _eventCollectionManagementService.CreateCollectionAsync(collection);
            return Ok(new EventCollectionDto(collection));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] EventCollectionDto dto)
        {
            var collection = await _eventCollectionRetrievalService
                .GetCollectionByIdAsync(id, new EventCollectionRetrievalOptions
                {
                    ForUpdate = true
                });

            dto.CopyTo(collection);

            await _eventCollectionManagementService.UpdateCollectionAsync(collection);

            return Ok(new EventCollectionDto(collection));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Archive(int id)
        {
            var collection = await _eventCollectionRetrievalService
                .GetCollectionByIdAsync(id, new EventCollectionRetrievalOptions
                {
                    ForUpdate = true
                });

            await _eventCollectionManagementService.ArchiveCollectionAsync(collection);
            return Ok();
        }
    }
}
