using Eventuras.Domain;
using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;

namespace Eventuras.WebApi.Controllers.Events.Collections
{
    public class EventCollectionDto
    {
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public int? Id { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int OrganizationId { get; set; }

        [Required]
        public string Name { get; set; }

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