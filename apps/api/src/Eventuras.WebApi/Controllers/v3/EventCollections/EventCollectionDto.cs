using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json.Serialization;
using Eventuras.Domain;
using NodaTime;

namespace Eventuras.WebApi.Controllers.v3.Events.Collections;

public class EventCollectionDto
{
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

        if (collection.Events?.Any() == true)
        {
            var eventsWithDates = collection.Events.Where(e => e.DateStart.HasValue).ToList();
            if (eventsWithDates.Count > 0)
            {
                DateStart = eventsWithDates.Min(e => e.DateStart);
                DateEnd = eventsWithDates.Max(e => e.DateEnd ?? e.DateStart);
            }
        }
    }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public int? Id { get; set; }

    [Required][Range(1, int.MaxValue)] public int OrganizationId { get; set; }

    [Required] public string Name { get; set; }

    public string Slug { get; set; }

    public string Description { get; set; }

    public bool Featured { get; set; }

    public string FeaturedImageUrl { get; set; }

    public string FeaturedImageCaption { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public LocalDate? DateStart { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public LocalDate? DateEnd { get; set; }

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
