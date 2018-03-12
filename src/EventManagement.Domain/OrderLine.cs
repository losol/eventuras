using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace losol.EventManagement.Domain
{


    public class OrderLine
    {
        public int OrderLineId { get; set;}

        public string Title {get;set;}
        public string Description {get;set;}
         

        public decimal Price {get;set;}
        public int VatPercent {get;set;} = 0;

        // Navigational properties
        // "Child" of an eventinfo.
        [Required]
        public int OrderId {get;set;}
        public Order Order {get;set;}


        public int ProductId {get;set;}

        public Product Product {get;set;}


    }
}