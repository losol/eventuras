using System;
using System.Collections.Generic;
using System.Linq;
using Eventuras.Domain;
using static Eventuras.Domain.EventInfo;
using static Eventuras.Domain.Registration;

namespace Eventuras.WebApi.Models
{
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
}

