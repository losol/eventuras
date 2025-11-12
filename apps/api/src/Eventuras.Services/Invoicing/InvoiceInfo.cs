using System.Collections.Generic;
using System.Linq;
using Eventuras.Domain;
using NodaTime;

namespace Eventuras.Services.Invoicing;

/// <summary>
///     POCO for new invoice.
/// </summary>
public class InvoiceInfo
{
    public string OrderId { get; set; }
    public LocalDate? OrderDate { get; set; }
    public string CustomerName { get; set; }
    public string CustomerEmail { get; set; }
    public string CustomerAddress { get; set; }
    public string CustomerCity { get; set; }
    public string CustomerZip { get; set; }
    public string CustomerCountry { get; set; } = "NO";
    public string CustomerVatNumber { get; set; }
    public string CustomerInvoiceReference { get; set; }
    public string ProjectCode { get; set; }
    public LocalDate? DueDate { get; set; }
    public PaymentMethod.PaymentProvider PaymentMethod { get; set; }
    public List<InvoiceLine> Lines { get; set; } = new();

    public static InvoiceInfo CreateFromOrderList(IReadOnlyCollection<Order> orders) =>
        new()
        {
            OrderId = string.Join('-', orders.Select(o => o.OrderId)),
            OrderDate = orders.Min(o => o.OrderTime.ToLocalDate()),
            DueDate = orders.CalculateDueDate(),
            CustomerEmail = orders.FirstFilled(o =>
                o.CustomerEmail ?? o.Registration.CustomerEmail ?? o.Registration.User.Email),
            CustomerName = orders.FirstFilled(o =>
                o.CustomerName ?? o.Registration.ParticipantName ?? o.Registration.User.Name),
            CustomerVatNumber = orders.FirstFilled(o => o.CustomerVatNumber),
            CustomerAddress = orders.FirstFilled(o => o.Registration.CustomerAddress),
            CustomerCity = orders.FirstFilled(o => o.Registration.CustomerCity),
            CustomerZip = orders.FirstFilled(o => o.Registration.CustomerZip),
            CustomerInvoiceReference = orders.FirstFilled(o => o.Registration.CustomerInvoiceReference),
            ProjectCode = orders.FirstFilled(o => o.Registration.EventInfo.ProjectCode),
            PaymentMethod = orders.First().PaymentMethod,
            Lines = orders.SelectMany(o =>
                new[] { new InvoiceLine { Type = InvoiceLineType.Text, Description = FormatDescription(o) } }.Concat(
                    o.OrderLines.Select(l => new InvoiceLine
                    {
                        Type = InvoiceLineType.Product,
                        Description = l.ProductVariantId.HasValue
                            ? $"{l.ProductName} ({l.ProductVariantName})"
                            : l.ProductName,
                        ProductCode = l.ItemCode,
                        ProductDescription = l.ProductVariantDescription ?? l.ProductDescription,
                        Quantity = l.Quantity,
                        Price = l.Price,
                        Total = l.LineTotal
                    }))).ToList()
        };

    private static string FormatDescription(Order order)
    {
        var customerName = order.CustomerName
                           ?? order.Registration.ParticipantName
                           ?? order.Registration.User.Name;

        var eventInfoTitle = order.Registration.EventInfo.Title;
        var invoiceDescription = $"Deltakelse for {customerName} på {eventInfoTitle}";

        if (order.Registration.EventInfo.DateStart != null)
        {
            invoiceDescription += $" {order.Registration.EventInfo.DateStart:d}";
        }

        if (order.Registration.EventInfo.DateEnd != null)
        {
            invoiceDescription += "-" + $"{order.Registration.EventInfo.DateEnd:d}";
        }

        return invoiceDescription;
    }
}
