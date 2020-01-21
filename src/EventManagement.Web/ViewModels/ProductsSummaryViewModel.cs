using System;
using System.Collections.Generic;
using System.Linq;
using losol.EventManagement.Domain;
using static losol.EventManagement.Domain.EventInfo;
using static losol.EventManagement.Domain.Registration;

namespace losol.EventManagement.ViewModels
{
	// This viewmodel is for showing all products ordered for a given product.

    public class ProductsSummaryViewModel
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

