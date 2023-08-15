using System.Collections.Generic;

namespace Eventuras.Services.Invoicing;

public class InvoiceResult
{
    public string InvoiceId { get; set; }

    public List<string> LogEntries { get; } = new();

    public InvoiceResult() { }

    public InvoiceResult(string invoiceId)
    {
        InvoiceId = invoiceId;
    }
}