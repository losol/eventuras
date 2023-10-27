using Eventuras.Domain;
using System.ComponentModel.DataAnnotations;

namespace Eventuras.WebApi.Controllers.v3.Events.Products
{
    public class NewProductVariantDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        [Range(0, double.MaxValue)] public decimal Price { get; set; }
        [Range(0, 99)] public int VatPercent { get; set; }

        public ProductVariant ToVariant()
        {
            return new ProductVariant
            {
                Name = Name,
                Description = Description,
                Price = Price,
                VatPercent = VatPercent
            };
        }
    }
}
