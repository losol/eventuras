using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace losol.EventManagement.Domain
{


    public class OrderLine
    {
        [Required]
        public int OrderLineId { get; set;}
        
        [Required]
        public int OrderId {get;set;}

        public int ProductId {get;set;}

        public int ProductVariantId {get;set;}

        public decimal Number {get;set;} = 1;

        public string Title {get;set;}
        public string Description {get;set;}

        public decimal Price {get;set;}
        public int VatPercent {get;set;} = 0;

        // Navigational properties
        // "Child" of an eventinfo.

        public Order Order {get;set;}


        

        public Product Product {get;set;}


    }
}