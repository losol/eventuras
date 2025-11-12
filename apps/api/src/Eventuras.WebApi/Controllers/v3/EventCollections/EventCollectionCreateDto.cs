using System.ComponentModel.DataAnnotations;
using Eventuras.Domain;

namespace Eventuras.WebApi.Controllers.v3.EventCollections;

public class EventCollectionCreateDto
{
    [Required][Range(1, int.MaxValue)] public int OrganizationId { get; set; }

    [Required] public string Name { get; set; }

    public string Slug { get; set; }

    public string Description { get; set; }

    public bool Featured { get; set; }

    public string FeaturedImageUrl { get; set; }

    public string FeaturedImageCaption { get; set; }

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
