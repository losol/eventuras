using System.ComponentModel.DataAnnotations;
using Eventuras.Domain;

namespace Eventuras.WebApi.Controllers.v3.Events.Products;

public class NewProductDto
{
    [Required] public string Name { get; set; }

    public string Description { get; set; }

    public string More { get; set; }

    [Range(0, double.MaxValue)] public decimal Price { get; set; }

    [Range(0, 99)] public int VatPercent { get; set; }

    public ProductVisibility Visibility { get; set; } = ProductVisibility.Event;

    public Product ToProduct() =>
        new()
        {
            Name = Name,
            Description = Description,
            MoreInformation = More,
            Price = Price,
            VatPercent = VatPercent,
            Visibility = Visibility
        };
}
