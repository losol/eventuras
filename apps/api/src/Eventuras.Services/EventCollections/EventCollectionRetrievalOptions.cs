namespace Eventuras.Services.EventCollections;

public sealed class EventCollectionRetrievalOptions
{
    public bool ForUpdate { get; set; }

    /// <summary>
    ///     Load events (many-to-many relationship).
    /// </summary>
    public bool LoadEvents { get; set; }

    /// <summary>
    ///     Load intermediate mapping entities (one-to-many relationship).
    /// </summary>
    public bool LoadMappings { get; set; }
}
