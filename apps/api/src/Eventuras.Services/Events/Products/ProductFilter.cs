using Eventuras.Domain;

namespace Eventuras.Services.Events.Products;

public sealed class ProductFilter
{
    public ProductVisibility Visibility { get; set; } = ProductVisibility.Event;

    public bool PublishedOnly { get; set; } = false;

    public bool MandatoryOnly { get; set; } = false;

    public bool IncludeArchived { get; set; } = false;

    public static readonly ProductFilter Default = new();
}
