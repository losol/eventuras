using System.ComponentModel.DataAnnotations;
using Eventuras.Domain;

namespace Eventuras.WebApi.Controllers.Events
{
    public class NewProductDto
    {
        [Required]
        public string Name { get; set; }

        public string Description { get; set; }

        public string More { get; set; }

        public decimal Price { get; set; }

        public int VatPercent { get; set; }

        public Product ToProduct()
        {
            return new Product
            {
                Name = Name,
                Description = Description,
                MoreInformation = More,
                Price = Price,
                VatPercent = VatPercent
            };
        }
    }
}