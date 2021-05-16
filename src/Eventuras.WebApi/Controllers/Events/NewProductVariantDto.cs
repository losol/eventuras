using Eventuras.Domain;

namespace Eventuras.WebApi.Controllers.Events
{
    public class NewProductVariantDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int VatPercent { get; set; }

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