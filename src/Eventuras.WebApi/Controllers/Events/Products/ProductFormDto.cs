using System;
using Eventuras.Domain;

namespace Eventuras.WebApi.Controllers.Events.Products;

public class ProductFormDto
{
    public bool? Published { get; set; }

    public ProductVisibility? Visibility { get; set; }

    public void ToProduct(Product product)
    {
        if (product == null) throw new ArgumentNullException(nameof(product));

        if (Published.HasValue) product.Published = Published.Value;

        if (Visibility.HasValue) product.Visibility = Visibility.Value;
    }
}