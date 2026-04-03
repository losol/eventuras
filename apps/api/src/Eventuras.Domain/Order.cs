using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using NodaTime;
using static Eventuras.Domain.PaymentMethod;

namespace Eventuras.Domain;

public class Order
{
    public enum OrderStatus
    {
        Draft,
        Verified,
        Invoiced,
        Cancelled,
        Refunded
    }

    /**
            Allowed transitions:
            Draft
            Draft -> Cancelled
            Draft -> Verified -> Cancelled
            Draft -> Verified -> Invoiced
            Draft -> Verified -> Invoiced -> Cancelled
         */
    private OrderStatus _status = OrderStatus.Draft;


    [Required] public int OrderId { get; set; }
    public Guid Uuid { get; set; } = Guid.CreateVersion7();
    public Guid UserId { get; set; }
    public int RegistrationId { get; set; }

    public int? InvoiceId { get; set; }

    public OrderStatus Status
    {
        get => _status;
        set
        {
            // Allow idempotent operations - setting the same status is a no-op
            if (_status == value)
            {
                return;
            }

            switch (value)
            {
                case OrderStatus.Draft:
                    throw new InvalidOperationException("Orders cannot be set as draft.");
                case OrderStatus.Verified:
                    if (_status != OrderStatus.Draft)
                    {
                        throw new InvalidOperationException("Only draft orders can be verified.");
                    }

                    break;
                case OrderStatus.Invoiced:
                    if (_status != OrderStatus.Verified)
                    {
                        throw new InvalidOperationException("Only verified orders can be invoiced.");
                    }

                    break;

                case OrderStatus.Refunded:
                    if (_status != OrderStatus.Invoiced)
                    {
                        throw new InvalidOperationException("Only invoiced orders can be refunded.");
                    }

                    break;

                case OrderStatus.Cancelled:
                    break;
            }

            _status = value;
        }
    }

    // Snapshot of customer details at order creation time
    public string CustomerName { get; set; }
    public string CustomerEmail { get; set; }
    public string CustomerVatNumber { get; set; }
    public string CustomerInvoiceReference { get; set; }

    public PaymentProvider PaymentMethod { get; set; }

    public Instant OrderTime { get; set; } = SystemClock.Instance.Now();

    // Comments are from the user registered
    public string Comments { get; set; }

    // Navigational properties
    public Registration Registration { get; set; }
    public ApplicationUser User { get; set; }
    public List<OrderLine> OrderLines { get; set; }

    [ForeignKey(nameof(InvoiceId))] public Invoice Invoice { get; set; }

    public bool CanEdit =>
        Status == OrderStatus.Draft || Status == OrderStatus.Verified;

    public decimal TotalAmount =>
        OrderLines.Sum(l => l.LineTotal);

}
