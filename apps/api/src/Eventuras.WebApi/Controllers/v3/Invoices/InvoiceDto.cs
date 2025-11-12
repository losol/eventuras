#nullable enable

using System.Linq;
using Eventuras.Domain;

namespace Eventuras.WebApi.Controllers.v3.Invoices;

public class InvoiceDto
{
    public InvoiceDto(Invoice invoice)
    {
        InvoiceId = invoice.InvoiceId;
        ExternalInvoiceId = invoice.ExternalInvoiceId;
        Paid = invoice.Paid;
        OrderIds = invoice.Orders.Select(o => o.OrderId).ToArray();
    }

    public int InvoiceId { get; set; }

    public string ExternalInvoiceId { get; set; }

    public bool Paid { get; set; }

    public int[] OrderIds { get; set; }
}
