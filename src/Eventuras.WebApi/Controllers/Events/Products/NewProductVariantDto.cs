using System.ComponentModel.DataAnnotations;
using Eventuras.Domain;

namespace Eventuras.WebApi.Controllers.Events.Products
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
