using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.EventCollections;
using Eventuras.Services.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace Eventuras.Web.Controllers.Api.V2
{
    [ApiVersion("2")]
    [Route("api/v{version:apiVersion}/events/collections")]
    [ApiController]
    [Authorize(Policy = AuthPolicies.AdministratorRole)]
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
            try
            {
                var c = await _eventCollectionRetrievalService
                    .GetCollectionByIdAsync(id, cancellationToken: cancellationToken);

                return Ok(new EventCollectionDto(c));
            }
            catch (NotFoundException e)
            {
                return NotFound(e.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] EventCollectionDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState.FormatErrors());
            }

            try
            {
                var collection = new EventCollection();
                dto.CopyTo(collection);
                await _eventCollectionManagementService.CreateCollectionAsync(collection);
                return Ok();
            }
            catch (NotAccessibleException e)
            {
                return NotFound(e.Message); // FIXME: can't return FORBIDDEN, it will redirect to login page!
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] EventCollectionDto dto)
        {
            try
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
            catch (NotFoundException e)
            {
                return NotFound(e.Message);
            }
            catch (NotAccessibleException e)
            {
                return NotFound(e.Message); // FIXME: can't return FORBIDDEN, it will redirect to login page!
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var collection = await _eventCollectionRetrievalService
                    .GetCollectionByIdAsync(id, new EventCollectionRetrievalOptions
                    {
                        ForUpdate = true
                    });

                await _eventCollectionManagementService.ArchiveCollectionAsync(collection);
                return Ok();
            }
            catch (NotFoundException e)
            {
                return NotFound(e.Message);
            }
            catch (NotAccessibleException e)
            {
                return NotFound(e.Message); // FIXME: can't return FORBIDDEN, it will redirect to login page!
            }
        }
    }

    public class EventCollectionDto
    {
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public int? Id { get; set; }

        [Required] [Range(1, int.MaxValue)] public int OrganizationId { get; set; }

        [Required] public string Name { get; set; }

        public string Slug { get; set; }

        public string Description { get; set; }

        public bool Featured { get; set; }

        public string FeaturedImageUrl { get; set; }

        public string FeaturedImageCaption { get; set; }

        public EventCollectionDto()
        {
        }

        public EventCollectionDto(EventCollection collection)
        {
            Id = collection.CollectionId;
            OrganizationId = collection.OrganizationId;
            Name = collection.Name;
            Slug = collection.Slug;
            Description = collection.Description;
            Featured = collection.Featured;
            FeaturedImageUrl = collection.FeaturedImageUrl;
            FeaturedImageCaption = collection.FeaturedImageCaption;
        }

        public void CopyTo(EventCollection collection)
        {
            collection.OrganizationId = OrganizationId;
            collection.Name = Name;
            collection.Description = Description;
            collection.Slug = Slug;
            collection.Featured = Featured;
            collection.FeaturedImageUrl = FeaturedImageUrl;
            collection.FeaturedImageCaption = FeaturedImageCaption;
        }
    }
}
