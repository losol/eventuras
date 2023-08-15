using System;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Invoicing;

namespace Eventuras.Web.Tests;

public class TestInvoicingProvider : IInvoicingProvider
{
    public const string TestLogEntry = "test invoice generated";
    public static InvoiceInfo LastInvoiceInfo;

    public bool AcceptPaymentProvider(PaymentMethod.PaymentProvider provider) => provider == PaymentMethod.PaymentProvider.EmailInvoice;

    public Task<InvoiceResult> CreateInvoiceAsync(InvoiceInfo info)
    {
        LastInvoiceInfo = info;
        return Task.FromResult(new InvoiceResult(Guid.NewGuid().ToString())
        {
            LogEntries = { TestLogEntry },
        });
    }
}