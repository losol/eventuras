using System.Collections.Generic;
using Eventuras.Domain;

namespace Eventuras.WebApi.Models;

// This dto is for showing all products ordered for a given product.

public class ProductsSummaryDto
{
    public List<ProductItem> Products { get; set; }
}

public class ProductItem
{
    public Product Product { get; set; }
    public ProductVariant Variant { get; set; }
    public int Quantity { get; set; }
}
