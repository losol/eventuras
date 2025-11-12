using System.Collections.Generic;
using Eventuras.Domain;

namespace Eventuras.Services.Orders;

public class ProductSummaryDto
{
    public int? ProductId { get; set; }
    public int? EventId { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string More { get; set; }
    public decimal Price { get; set; }
    public decimal VatPercent { get; set; }
    public ProductVisibility Visibility { get; set; }
    public int MinimumQuantity { get; set; }
    public bool? IsMandatory { get; set; }
    public bool EnableQuantity { get; set; }

    public static ProductSummaryDto FromProduct(Product product) =>
        new()
        {
            ProductId = product.ProductId,
            EventId = product.EventInfoId,
            Name = product.Name,
            Description = product.Description,
            More = product.MoreInformation,
            Price = product.Price,
            VatPercent = product.VatPercent,
            Visibility = product.Visibility,
            MinimumQuantity = product.MinimumQuantity,
            IsMandatory = product.IsMandatory,
            EnableQuantity = product.EnableQuantity
        };
}

public class ProductDeliverySummaryDto
{
    public ProductSummaryDto Product { get; set; }
    public List<ProductOrdersSummaryDto> OrderSummary { get; set; }
    public ProductStatisticsDto Statistics { get; set; }
}
