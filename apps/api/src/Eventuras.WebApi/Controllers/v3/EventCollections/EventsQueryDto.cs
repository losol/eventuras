using Eventuras.Services.EventCollections;
using Eventuras.WebApi.Models;

namespace Eventuras.WebApi.Controllers.v3.Events;

public class EventCollectionsQueryDto : PageQueryDto
{
    public bool? Featured { get; set; }

    public bool IncludePastCollections { get; set; }

    public EventCollectionFilter ToFilter()
    {
        return new EventCollectionFilter
        {
            FeaturedOnly = Featured,
            IncludePastCollections = IncludePastCollections
        };
    }
}
