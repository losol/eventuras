using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.Invoicing;

internal class InvoicingService : IInvoicingService
{
    private readonly IInvoicingProvider[] _components;
    private readonly ILogger<InvoicingService> _logger;
    private readonly ApplicationDbContext _db;

    public InvoicingService(IEnumerable<IInvoicingProvider> components, ILogger<InvoicingService> logger, ApplicationDbContext db)
    {
        _components = components?.ToArray() ?? throw new ArgumentNullException(nameof(components));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<Invoice> CreateInvoiceAsync(Order[] orders, InvoiceInfo info)
    {
        orders.Check();

        info ??= InvoiceInfo.CreateFromOrderList(orders);

        _logger.LogInformation("Making invoice for orders: {OrderIds}, payment method: {PaymentMethod}", info.OrderId, info.PaymentMethod);

        var invoice = new Invoice
        {
            Orders = orders.ToList(),
        };

        var provider = _components.FirstOrDefault(c => c.AcceptPaymentProvider(info.PaymentMethod));

        if (provider == null)
        {
            var message = $"No invoicing provider found for payment method {info.PaymentMethod}";
            _logger.LogWarning(message);

            foreach (var order in orders) order.AddLog(message);
        }
        else
        {
            var result = await provider.CreateInvoiceAsync(info);
            invoice.ExternalInvoiceId = result.InvoiceId;

            foreach (var logEntry in result.LogEntries)
            foreach (var order in orders)
                order.AddLog(logEntry);
        }

        foreach (var order in orders)
        {
            order.Invoice = invoice;
            order.MarkAsInvoiced();
            _db.Orders.Update(order);
        }

        _db.Invoices.Add(invoice);
        await _db.SaveChangesAsync();
        return invoice;
    }
}