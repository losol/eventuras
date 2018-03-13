using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace losol.EventManagement.Domain
{


    public class Order
    {
        [Required]
        public int OrderId { get; set; }
    
        public string UserId {get;set;}

        // From registration, should be Participant details, if Customer details
        // does not exist.
        public string CustomerName {get; set;}
        public string CustomerEmail {get; set;}
        public string CustomerVatNumber {get;set;}
        public string CustomerInvoiceReference {get;set;}
        public int? PaymentMethodId {get;set;}

        public bool FreeRegistration { get; set; } = false;

        public DateTime OrderTime {get;set;}

        // Navigational properties
        
        public int RegistrationId {get;set;}
        public Registration Registration {get;set;}

        public PaymentMethod PaymentMethod {get;set;}

        // Navigational properties
        public List<OrderLine> OrderLines {get;set;}

    }
}