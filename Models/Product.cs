using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Data;

namespace losol.EventManagement.Models
{


    public class Product
    {
        public int ProductId { get; set; }
        public string Name {get;set;}

        public int MandatoryCount {get;set;} = 0;

        // Navigational properties
        // "Child" of an eventinfo.
        public int EventInfoId {get;set;}
        public EventInfo Eventinfo {get;set;}

        // Has a list of productvariants.
        public List<ProductVariant> ProductVariants {get;set;}
    }
}