namespace Eventuras.Services.EventCollections;

public class EventCollectionFilter
{
    public int? EventInfoId { get; set; }

    public bool IncludeArchived { get; set; }

    public bool? FeaturedOnly { get; set; }

    /// <summary>
    /// When false (default), only collections with at least one ongoing or future event are returned.
    /// </summary>
    public bool IncludePastCollections { get; set; }
}
