using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using GoApi;
using GoApi.Invoices;
using GoApi.Common;
using GoApi.Core;

using losol.EventManagement.Domain;

namespace losol.EventManagement.Services.PowerOffice
{
    public class PowerOfficeService : IPowerOfficeService
    {
        private readonly Go api;
        public PowerOfficeService(IOptions<PowerOfficeOptions> options)
        {
            GoApi.Global.Settings.Mode = options.Value.Mode;
            var authorizationSettings = new AuthorizationSettings
            {
                ApplicationKey = options.Value.ApplicationKey,
                ClientKey = options.Value.ClientKey,
                TokenStore = new BasicTokenStore(options.Value.TokenStoreName)
            };
            var authorization = new Authorization(authorizationSettings);
            api = new Go(authorization);
        }

        public void SendInvoice(Order order)
        {
            var invoice = new OutgoingInvoice 
            {    
                Status = OutgoingInvoiceStatus.Approved, // DOES NOT ACTUALLY SEND IT
                OrderDate = order.OrderTime,
                CustomerReference = order.CustomerInvoiceReference,

                // BrandingThemeCode = "",
                // ContractNo = "",
                // CurrencyCode = "",
                // CustomerCode = null,
                
                // DeliveryAddressId = 0,
                // DeliveryDate = null,
                // DepartmentCode = "",
                // ImportedOrderNo = null,
                
                // OurReferenceEmployeeCode = null,
                // PaymentTerms = null,
                // ProjectCode = "",
                // PurchaseOrderNo = null
            };
            foreach(var orderline in order.OrderLines)
            {
                var invoiceLine = new OutgoingInvoiceLine
                {
                    LineType = VoucherLineType.Normal,
                    ProductCode = $"{orderline.ProductId}-{orderline.ProductVariantId}",
                    Quantity = orderline.Quantity,
                    Description = orderline.ProductVariantDescription ?? orderline.ProductDescription,
                    UnitPrice = orderline.Price,

                    // ExemptVat = null,
                    // IsDeleted = null,                    
                    // ProjectCode = null,
                    // DepartmentCode = null,
                    // DiscountPercent = null,
                    // SalesPersonEmployeeCode = null,
                    // SortOrder = 0,
                    // UnitOfMeasure = ""
                };
                invoice.OutgoingInvoiceLines.Add(invoiceLine);
            }
            
            api.OutgoingInvoice.Save(invoice);
        }
    }
}
