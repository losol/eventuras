using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text.Json.Serialization;
using NodaTime;
using static Eventuras.Domain.Order;
using static Eventuras.Domain.PaymentMethod;

namespace Eventuras.Domain;

public class Registration
{
    public enum RegistrationStatus
    {
        Draft = 0,
        Cancelled = 1,
        Verified = 2,
        NotAttended = 3,
        Attended = 4,
        Finished = 5,
        WaitingList = 6
    }

    public enum RegistrationType
    {
        Participant = 0,
        Student = 1,
        Staff = 2,
        Lecturer = 3,
        Artist = 4
    }

    public int RegistrationId { get; set; }
    public int EventInfoId { get; set; }
    public string UserId { get; set; }

    public RegistrationStatus Status { get; set; } = RegistrationStatus.Draft;
    public RegistrationType Type { get; set; } = RegistrationType.Participant;

    [Display(Name = "Skal ha kursdiplom?")]
    public bool Diploma { get; set; } = true;

    // The participant - TODO: Consider removing, at least the name
    public string ParticipantName { get; set; }
    public string ParticipantJobTitle { get; set; }
    public string ParticipantEmployer { get; set; }
    public string ParticipantCity { get; set; }

    [NotMapped] private IEnumerable<string> NameParts => ParticipantName?.Split(" ")?.Select(p => p.Trim());

    [NotMapped]
    public string ParticipantFirstName
    {
        get
        {
            var parts = NameParts?.ToArray();
            return parts == null ? null
                : parts.Length == 1 ? parts[0]
                : string.Join(" ", parts.Take(parts.Length - 1));
        }
    }

    [NotMapped] public string ParticipantLastName => NameParts?.LastOrDefault();

    // Who pays for it?
    public string CustomerName { get; set; }
    public string CustomerEmail { get; set; }
    public string CustomerAddress { get; set; }
    public string CustomerZip { get; set; }
    public string CustomerCity { get; set; }
    public string CustomerCountry { get; set; }
    public string CustomerVatNumber { get; set; }
    public string CustomerInvoiceReference { get; set; }

    [Display(Name = "Kommentar")]
    [DataType(DataType.MultilineText)]
    public string Notes { get; set; }

    [Display(Name = "Logg")]
    [DataType(DataType.MultilineText)]
    public string Log { get; set; }

    public Instant? RegistrationTime { get; set; } = SystemClock.Instance.Now();
    public string RegistrationBy { get; set; }

    [Display(Name = "Gratisdeltaker?")] public bool FreeRegistration { get; set; } = false;

    [Display(Name = "Betalingsmetode")]
    public PaymentProvider PaymentMethod { get; set; } =
        PaymentProvider
            .PowerOfficeEmailInvoice; // HACK: This ignores the actual default paymentmethod set in the database

    [Display(Name = "Verifisert påmelding?")]
    public bool Verified { get; set; } = false;

    [Display(Name = "Verifiseringskode")] public string VerificationCode { get; set; }

    public int? CertificateId { get; set; }

    [JsonIgnore]
    public Certificate Certificate { get; set; }
    public string CertificateComment { get; set; }

    // Navigation properties
    public EventInfo EventInfo { get; set; }
    public ApplicationUser User { get; set; }

    public List<ExternalAccount> ExternalAccounts { get; set; }

    public List<ExternalRegistration> ExternalRegistrations { get; set; }

    public List<Order> Orders { get; set; }

    [NotMapped] public List<OrderDTO> Products => GetCurrentProducts();

    public List<OrderDTO> GetCurrentProducts() =>
        _getProductsForOrders(Orders.Where(o => o.Status != OrderStatus.Cancelled));

    public List<OrderDTO> GetInvoicedProducts() =>
        _getProductsForOrders(Orders.Where(o => o.Status is OrderStatus.Invoiced or OrderStatus.Refunded));

    private static List<OrderDTO> _getProductsForOrders(IEnumerable<Order> orders)
    {
        return orders.SelectMany(o => o.OrderLines)
            .GroupBy(ol => new { ol.ProductId, ol.ProductVariantId })
            .Select(group =>
            {
                var first = group.First();

                return new OrderDTO
                {
                    Product = first.Product,
                    Variant = first.ProductVariant,
                    Quantity = group.Sum(g1 => g1.Quantity)
                };
            })
            .Where(p => p.Quantity != 0)
            .ToList();
    }






    public bool HasOrder => Orders != null && Orders.Count > 0;
    public bool HasCertificate => CertificateId != null;

    public Certificate CreateCertificate()
    {
        if (Certificate != null)
        {
            throw new InvalidOperationException(
                $"{nameof(Registration)}.{nameof(Certificate)} is already set for registration {RegistrationId}");
        }

        Certificate = new Certificate();
        UpdateCertificate();
        return Certificate;
    }

    public Certificate UpdateCertificate()
    {
        if (Certificate == null)
        {
            throw new InvalidOperationException($"{nameof(Registration)}.{nameof(Certificate)} is null");
        }

        if (EventInfo == null)
        {
            throw new InvalidOperationException($"{nameof(Registration)}.{nameof(EventInfo)} is null");
        }

        if (User == null)
        {
            throw new InvalidOperationException($"{nameof(Registration)}.{nameof(User)} is null");
        }

        EventInfo.FillCertificate(Certificate);
        Certificate.Comment = CertificateComment;
        Certificate.RecipientName = User.Name;
        Certificate.RecipientEmail = User.Email;
        Certificate.RecipientUserId = User.Id;
        return Certificate;
    }

    public void AddLog(string text = null)
    {
        var logText = $"{DateTime.UtcNow.ToString("u")}: ";
        if (!string.IsNullOrWhiteSpace(text))
        {
            logText += $"{text}";
        }
        else
        {
            logText += $"{Status}";
        }

        Log += logText + "\n";
    }

    [Obsolete("Use IOrderManagementService instead")]
    public Order CreateOrder(IEnumerable<OrderDTO> orders, IEnumerable<OrderLine> refundlines = null)
    {
        _ = orders ?? throw new ArgumentNullException(nameof(orders));

        // Check if the products belongs to the event
        if (orders != null && orders.Where(p => p.Product.EventInfoId != EventInfoId).Any())
        {
            throw new ArgumentException(
                message: "All the products must belong to the event being registered for.",
                paramName: nameof(orders)
            );
        }

        // Check if the variants belong to the product
        // FIXME: Don't trust the DTO, check with real data instead!
        if (!orders.Where(o => o.Variant != null).All(o => o.Variant.ProductId == o.Product.ProductId))
        {
            throw new ArgumentException(
                message: "Variant & Product IDs must match.",
                paramName: nameof(orders)
            );
        }

        // Create the order ...
        var order = new Order
        {
            UserId = UserId,

            CustomerName = CustomerName ?? ParticipantName,
            CustomerEmail = CustomerEmail ?? CustomerEmail,
            CustomerVatNumber = CustomerVatNumber,
            CustomerInvoiceReference = CustomerInvoiceReference,

            PaymentMethod = PaymentMethod,
            RegistrationId = RegistrationId
        };
        order.OrderLines = _createOrderLines(orders, refundlines);
        order.AddLog();

        // ... and add it to the current registration
        this.Orders = this.Orders ?? new List<Order>();
        this.Orders.Add(order);
        return order;
    }

    /// <summary>
    /// Updates an existing order if it's not already been invoiced.
    /// Else creates a new order.
    /// </summary>
    [Obsolete("Use IOrderManagementService service")]
    public Order CreateOrUpdateOrder(ICollection<OrderDTO> dtos)
    {
        // Check if any editable orders exist
        var editableOrders = Orders.Where(o => o.CanEdit).ToArray();
        var editableOrderExists = editableOrders.Any();

        // Get the existing productids
        var orders = dtos.ToList();

        if (!editableOrderExists)
        {
            var products = GetCurrentProducts();
            var refundDtos = new List<OrderDTO>();
            var refundLines = new List<OrderLine>();
            foreach (var order in orders)
            {
                foreach (var p in products)
                {
                    if (order.Product.ProductId == p.Product.ProductId)
                    {
                        var orderQuantity = order.Quantity - p.Quantity;
                        var orderline = new OrderLine
                        {
                            // OrderId = OrderId,
                            ProductName = $"Korreksjon for {p.Product?.Name}",
                            Price = order.Variant?.Price ?? order.Product.Price,
                            Quantity = orderQuantity,
                            VatPercent = order.Variant?.VatPercent ?? order.Product.VatPercent,
                            ProductId = order.Product.ProductId,
                            ProductVariantId = order.Variant?.ProductVariantId,
                            Product = order.Product,
                            ProductVariant = order.Variant
                        };

                        var shouldReplaceProductVariant =
                            order.Variant?.ProductVariantId != p.Variant?.ProductVariantId;
                        if (shouldReplaceProductVariant)
                        {
                            orderline.Quantity = -p.Quantity;
                            orderline.Price = p.Variant.Price;
                            orderline.ProductId = p.Product.ProductId;
                            orderline.ProductVariantId = p.Variant.ProductVariantId;
                            orderline.Product = p.Product;
                            orderline.ProductVariant = p.Variant;
                        }

                        if (orderline.Quantity != 0)
                        {
                            refundLines.Add(orderline);
                        }

                        if (!shouldReplaceProductVariant)
                        {
                            refundDtos.Add(order);
                        }
                    }
                }
            }

            refundDtos.ForEach(dto => orders.Remove(dto));
            refundDtos = null;

            // Create a new order
            return CreateOrder(orders, refundLines);
        }
        else // an editable (uninvoiced) order exists
        {
            var order = editableOrders.First();
            UpdateOrder(order, orders);
            return order;
        }
    }

    [Obsolete("Use IOrderManagementService instead")]
    public void UpdateOrder(Order orderToUpdate, IEnumerable<OrderDTO> orders)
    {
        if (orderToUpdate.RegistrationId != RegistrationId)
        {
            throw new InvalidOperationException(
                $"Order {orderToUpdate.OrderId} doesn't belong to registration {RegistrationId}");
        }

        var lines = orderToUpdate.OrderLines;
        var invoicedProducts = GetInvoicedProducts();
        foreach (var order in orders)
        {
            var match = lines.Find(l => l.ProductId == order.Product.ProductId);
            if (match != null)
            {
                lines.Remove(match);
            }

            var product = invoicedProducts.Find(p => p.Product.ProductId == order.Product.ProductId);
            if (order.Quantity == 0)
            {
                return;
            }

            var orderline = order.ToOrderLine();
            if (product != null &&
                product.Variant?.ProductVariantId !=
                order.Variant?.ProductVariantId) // if a product variant is being replaced
            {
                lines.Add(orderline);
                var refundLine = product.ToOrderLine();
                refundLine.Quantity = -refundLine.Quantity;
                lines.Add(refundLine);
            }
            else
            {
                orderline.Quantity = order.Quantity - (product?.Quantity ?? 0);
                if (orderline.Quantity != 0)
                {
                    lines.Add(orderline);
                }
            }
        }
    }

    private List<OrderLine> _createOrderLines(
        IEnumerable<OrderDTO> orders,
        IEnumerable<OrderLine> refundlines = null)
    {
        refundlines = refundlines ?? new List<OrderLine>();
        var orderLines = orders.ToOrderLines();
        return orderLines.Concat(refundlines).ToList();
    }
}

public class OrderDTO
{
    public Product Product { get; set; }
    public ProductVariant Variant { get; set; }
    public int Quantity { get; set; } = 1; // FIXME: Should default to Product.MinimumQuantity

    public override string ToString() =>
        $"{Product.ProductId}-{Variant?.ProductVariantId.ToString() ?? "NA"}×{Quantity}";
}

/// <summary>
/// Compares OrderDTOs using the ProductId & VariantId
/// </summary>
public class OrderDTOProductAndVariantComparer : IEqualityComparer<OrderDTO>
{
    public bool Equals(OrderDTO x, OrderDTO y) => x.Product.ProductId == y.Product.ProductId &&
                                                  x.Variant?.ProductVariantId == y.Variant?.ProductVariantId;

    public int GetHashCode(OrderDTO obj) => obj.Product.ProductId;
}

/// <summary>
/// Compares OrderDTOs using the ProductId & VariantId
/// </summary>
public class ProductAndVariantIdComparer : IEqualityComparer<(Product product, ProductVariant variant)>
{
    public bool Equals((Product product, ProductVariant variant) x, (Product product, ProductVariant variant) y) =>
        x.product.ProductId == y.product.ProductId && x.variant?.ProductVariantId == y.variant?.ProductVariantId;

    public int GetHashCode((Product product, ProductVariant variant) obj)
        => $"{obj.product.ProductId}-{obj.variant?.ProductVariantId.ToString() ?? "NA"}".GetHashCode();
}

public static class OrderDTOExtensions
{
    public static List<OrderLine> ToOrderLines(this IEnumerable<OrderDTO> orders)
    {
        return orders.Where(o => o.Quantity != 0)
            .Select(o => o.ToOrderLine())
            .ToList();
    }

    public static OrderLine ToOrderLine(this OrderDTO order) =>
        new(order.Product, Math.Max(order.Quantity, order.Product.MinimumQuantity), order.Variant);
}
