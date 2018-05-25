using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace losol.EventManagement.Domain
{
    public class PaymentMethod
    {
        public enum PaymentProvider
        {
            EmailInvoice,
            StripeInvoice,
            PowerOfficeEmailInvoice,
            PowerOfficeEHFInvoice,
            VippsDirect,
            StripeDirect,
            VippsInvoice,
        }

        public enum PaymentProviderType
        {
            Direct,
            Invoice
        }

        public int PaymentMethodId { get; set; }

        public string Name { get; set; }
        public PaymentProvider Provider { get; set; }
        public PaymentProviderType Type { get; set; }

        public bool Active { get; set; } = false;
        public bool AdminOnly { get; set; } = false;
        public bool IsDefault { get; set; } = false;
    }
}
