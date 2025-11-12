using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Eventuras.Domain;

public class Product
{
    public int ProductId { get; set; }

    [Required] public string Name { get; set; }

    [StringLength(300)] public string Description { get; set; }

    public string MoreInformation { get; set; }

    public bool EnableQuantity { get; set; } = false;

    public int MinimumQuantity { get; set; } = 0;

    public decimal Price { get; set; }
    public int VatPercent { get; set; } = 0;

    public int Inventory { get; set; } = 0;
    public bool Published { get; set; } = true;

    public bool Archived { get; set; }

    /// <summary>
    ///     By default, product is only visible in the context of single event.
    /// </summary>
    public ProductVisibility Visibility { get; set; } = ProductVisibility.Event;

    // Order used to display the products
    // Products with lower values should be shown first.
    public int DisplayOrder { get; set; } = int.MaxValue;

    // Navigational properties
    // "Child" of an eventinfo.
    public int EventInfoId { get; set; }
    public EventInfo EventInfo { get; set; }

    // Has a list of productvariants.
    public List<ProductVariant> ProductVariants { get; set; }

    public List<OrderLine> OrderLines { get; set; }

    public bool IsMandatory => MinimumQuantity > 0;
}

public enum ProductVisibility
{
    /// <summary>
    ///     Product accessible for a single event only.
    /// </summary>
    Event = 1,

    /// <summary>
    ///     Product accessible for other events in collection, too.
    /// </summary>
    Collection = 10
}
