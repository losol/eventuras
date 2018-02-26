using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Data;

namespace losol.EventManagement.Models
{


    public class ProductVariant
    {
        public int ProductVariantId { get; set; }
        public string Name {get;set;}

        public float Price {get;set;} = 0;
        public int VatPercent {get;set;} = 0;

        public bool AdminOnly {get;set;} = false;

        // Navigational properties
        public int ProductId {get;set;}
        public Product Product {get;set;}
    }
}