using System.ComponentModel.DataAnnotations.Schema;

namespace Eventuras.Domain;

public class EventCollectionMapping
{
    public int CollectionId { get; set; }
    public int EventId { get; set; }

    [ForeignKey(nameof(CollectionId))] public virtual EventCollection Collection { get; set; }

    [ForeignKey(nameof(EventId))] public virtual EventInfo Event { get; set; }
}
