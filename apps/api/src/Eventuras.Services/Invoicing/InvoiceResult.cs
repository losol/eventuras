using System.Collections.Generic;

namespace Eventuras.Services.Invoicing;

public class InvoiceResult
{
    public InvoiceResult()
    {
    }

    public InvoiceResult(string invoiceId) => InvoiceId = invoiceId;
    public string InvoiceId { get; set; }

    public List<string> LogEntries { get; } = new();
}
