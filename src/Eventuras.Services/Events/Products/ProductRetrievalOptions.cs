namespace Eventuras.Services.Events.Products;

public sealed class ProductRetrievalOptions
{
    public bool ForUpdate { get; set; }

    public bool LoadEvent { get; set; }

    public bool LoadVariants { get; set; }

    public static readonly ProductRetrievalOptions Default = new();
}