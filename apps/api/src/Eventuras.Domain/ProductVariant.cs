using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Eventuras.Domain;



public class ProductVariant
{
    public int ProductVariantId { get; set; }
    public string Name { get; set; }

    [StringLength(300)]
    public string Description { get; set; }

    public decimal Price { get; set; } = 0;
    public int VatPercent { get; set; } = 0;

    public bool AdminOnly { get; set; } = false;

    public int Inventory { get; set; } = 0;
    public bool Published { get; set; } = true;

    public bool Archived { get; set; }

    // Navigational properties
    public int ProductId { get; set; }
    public Product Product { get; set; }
    public List<OrderLine> OrderLines { get; set; }
}
