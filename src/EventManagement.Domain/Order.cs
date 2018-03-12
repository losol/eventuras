using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace losol.EventManagement.Domain
{


    public class Order
    {
        public int OrderId { get; set; }
        
        [Required]
        public string UserId {get;set;}

        public DateTime OrderTime {get;set;}

        // Navigational properties
        public int RegistrationId {get;set;}
        public Registration Registration {get;set;}

        public List<OrderLine> OrderLines {get;set;}

    }
}