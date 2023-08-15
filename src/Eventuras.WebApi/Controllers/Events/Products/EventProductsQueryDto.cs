using Eventuras.Domain;
using Eventuras.Services.Events.Products;

namespace Eventuras.WebApi.Controllers.Events.Products;

public class EventProductsQueryDto
{
    public ProductVisibility Visibility { get; set; } = ProductVisibility.Event;

    public ProductFilter ToProductFilter()
        => new()
        {
            Visibility = Visibility,
        };
}