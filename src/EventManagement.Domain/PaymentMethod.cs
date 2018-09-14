using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace losol.EventManagement.Domain
{
    public class PaymentMethod
    {

        [Key, DatabaseGenerated(DatabaseGeneratedOption.None)]
        public PaymentProvider Provider { get; set; }
        public PaymentProviderType Type { get; set; }

        public string Name { get; set; }
        public bool Active { get; set; } = false;
        public bool AdminOnly { get; set; } = false;
        public bool IsDefault { get; set; } = false;


        public enum PaymentProvider
        {
            EmailInvoice = 1,
            PowerOfficeEmailInvoice = 2,
            PowerOfficeEHFInvoice = 3,
            StripeInvoice = 4,
            StripeDirect = 5,
            VippsInvoice = 6,
            VippsDirect = 7
        }

        public enum PaymentProviderType
        {
            Direct,
            Invoice
        }
    }
}
