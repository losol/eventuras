using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Orders;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.Invoicing;

internal class InvoicingService : IInvoicingService
{
    private readonly IInvoicingProvider[] _components;
    private readonly ApplicationDbContext _db;
    private readonly ILogger<InvoicingService> _logger;
    private readonly IOrderAccessControlService _orderAccessControlService;

    public InvoicingService(
        IEnumerable<IInvoicingProvider> components,
        IOrderAccessControlService orderAccessControlService,
        ILogger<InvoicingService> logger,
        ApplicationDbContext db)
    {
        _components = components?.ToArray() ?? throw new ArgumentNullException(nameof(components));
        _orderAccessControlService = orderAccessControlService ??
                                     throw new ArgumentNullException(nameof(orderAccessControlService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<Invoice> CreateInvoiceAsync(Order[] orders, InvoiceInfo info)
    {
        orders.Check();

        foreach (var order in orders)
        {
            await _orderAccessControlService.CheckOrderUpdateAccessAsync(order);
        }

        info ??= InvoiceInfo.CreateFromOrderList(orders);

        _logger.LogInformation("Making invoice for orders: {OrderIds}, payment method: {PaymentMethod}",
            info.OrderId,
            info.PaymentMethod);

        var invoice = new Invoice { Orders = orders.ToList() };

        var provider = _components.FirstOrDefault(c => c
            .AcceptPaymentProvider(info.PaymentMethod));

        if (provider == null)
        {
            var message = $"No invoicing provider found for payment method {info.PaymentMethod}";
            _logger.LogWarning(message);

            foreach (var order in orders)
            {
                order.AddLog(message);
            }
        }
        else
        {
            var result = await provider.CreateInvoiceAsync(info);
            invoice.ExternalInvoiceId = result.InvoiceId;

            foreach (var logEntry in result.LogEntries)
            {
                foreach (var order in orders)
                {
                    order.AddLog(logEntry);
                }
            }
        }

        foreach (var order in orders)
        {
            order.Invoice = invoice;
            order.SetStatus(Order.OrderStatus.Invoiced);
            _db.Orders.Update(order);
        }

        _db.Invoices.Add(invoice);
        await _db.SaveChangesAsync();
        return invoice;
    }

    public async Task<Invoice> GetInvoiceByIdAsync(int invoiceId, CancellationToken cancellationToken = default)
    {
        var invoice = await _db.Invoices
            .Include(i => i.Orders)
            .FirstOrDefaultAsync(i => i.InvoiceId == invoiceId);

        if (invoice == null)
        {
            throw new InvoicingException($"Invoice with id {invoiceId} not found.");
        }

        foreach (var order in invoice.Orders)
        {
            await _orderAccessControlService.CheckOrderReadAccessAsync(order);
        }

        return invoice;
    }
}
