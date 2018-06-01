using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using static losol.EventManagement.Domain.Order;
using static losol.EventManagement.Domain.PaymentMethod;

namespace losol.EventManagement.Domain
{

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

        // The participant
        public string ParticipantName { get; set; }
        public string ParticipantJobTitle { get; set; }
        public string ParticipantEmployer { get; set; }
        public string ParticipantCity { get; set; }

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

        public DateTime? RegistrationTime { get; set; }
        public string RegistrationBy { get; set; }

        [Display(Name = "Gratisdeltaker?")]
        public bool FreeRegistration { get; set; } = false;

        [Display(Name = "Betalingsmetode")]
        public PaymentProvider? PaymentMethod { get; set; }
        public int? PaymentMethodId { get; set; }

        [Display(Name = "Verifisert påmelding?")]
        public bool Verified { get; set; } = false;

        [Display(Name = "Verifiseringskode")]
        public string VerificationCode { get; set; }

        public int? CertificateId { get; set; }
        public Certificate Certificate { get; set; }

        // Navigation properties
        public EventInfo EventInfo { get; set; }
        public ApplicationUser User { get; set; }
        // public PaymentMethod PaymentMethod { get; set; }
        public List<Order> Orders { get; set; }

        [NotMapped]
        public List<OrderDTO> Products => GetCurrentProducts();

        public List<OrderDTO> GetCurrentProducts() =>
            _getProductsForOrders(Orders.Where(o => o.Status != OrderStatus.Cancelled));

        public List<OrderDTO> GetInvoicedProducts() =>
            _getProductsForOrders(Orders.Where(o => o.Status == OrderStatus.Invoiced || o.Status == OrderStatus.Refunded));

        private static List<OrderDTO> _getProductsForOrders(IEnumerable<Order> orders)
        {
            var productOrderLines = orders.SelectMany(o => o.OrderLines)
                .Select(l => new { product = l.Product, variant = l.ProductVariant, quantity = l.Quantity });
            return productOrderLines
                .GroupBy(l => (product: l.product, variant: l.variant), new ProductAndVariantIdComparer())
                .Select(g => new OrderDTO { Product = g.Key.product, Variant = g.Key.variant, Quantity = g.Sum(t => t.quantity ) })
                .Where(p => p.Quantity > 0)
                .ToList();
        }

        public void Verify()
        {
            Status = RegistrationStatus.Verified;
            Verified = true;
            AddLog();
        }
        public void MarkAsAttended()
        {
            Status = RegistrationStatus.Attended;
            AddLog();
        }

        public void MarkAsNotAttended()
        {
            Status = RegistrationStatus.NotAttended;
            AddLog();
        }

        public bool HasOrder => Orders != null && Orders.Count > 0;
        public bool HasCertificate => CertificateId != null;

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

        public void CreateOrder(IEnumerable<OrderDTO> orders, IEnumerable<OrderLine> refundlines = null)
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
        }

        /// <summary>
        /// Updates an existing order if it's not already been invoiced.
        /// Else creates a new order.
        /// </summary>
        /// <param name="orders"></param>
        /// <param name="variants"></param>
        public void CreateOrUpdateOrder(ICollection<OrderDTO> dtos)
        {
            // Check if any editable orders exist
            var editableOrders = Orders.Where(o => o.CanEdit);
            var editableOrderExists = editableOrders.Any();

            // Get the existing productids
            var products = editableOrderExists ? GetInvoicedProducts() : GetCurrentProducts();
            var orders = dtos.ToList();

            if (!editableOrderExists)
            {
                var refundDtos = new List<OrderDTO>();
                var refundLines = new List<OrderLine>();
                foreach(var order in orders)
                {
                    foreach(var p in products)
                    {
                        if(order.Product.ProductId == p.Product.ProductId)
                        {
                            var orderline = new OrderLine
                            {
                                // OrderId = OrderId,
                                ProductName = $"Korreksjon for {p.Product?.Name}",
                                Price = order.Variant?.Price ?? order.Product.Price,
                                Quantity = order.Quantity - p.Quantity,
                                VatPercent = order.Variant?.VatPercent ?? order.Product.VatPercent,
                                ProductId = order.Product.ProductId,
                                ProductVariantId = order.Variant?.ProductVariantId,
                                Product = order.Product,
                                ProductVariant = order.Variant
                            };

                            var shouldReplaceProductVariant = order.Variant?.ProductVariantId != p.Variant?.ProductVariantId;
                            if(shouldReplaceProductVariant)
                            {
                                orderline.Quantity = -p.Quantity;
                                orderline.Price = p.Variant.Price;
                                orderline.ProductId = p.Product.ProductId;
                                orderline.ProductVariantId = p.Variant.ProductVariantId;
                                orderline.Product = p.Product;
                                orderline.ProductVariant = p.Variant;
                            }

                            if(orderline.Quantity != 0)
                            {
                                refundLines.Add(orderline);
                            }

                            if(!shouldReplaceProductVariant)
                            {
                                refundDtos.Add(order);
                            }
                        }
                    }
                }

                refundDtos.ForEach(dto => orders.Remove(dto));
                refundDtos = null;

                // Create a new order
                CreateOrder(orders, refundLines);
            }
            else // an editable (uninvoiced) order exists
            {
                var orderToUpdate = editableOrders.First();
                var lines = orderToUpdate.OrderLines;
                foreach(var order in orders)
                {
                    var match = lines.Find(l => l.ProductId == order.Product.ProductId);
                    if(match != null)
                    {
                        lines.Remove(match);
                    }
                    var product = products.Find(p => p.Product.ProductId == order.Product.ProductId);
                    var orderline = order.ToOrderLine();
                    orderline.Quantity = order.Quantity - (product?.Quantity ?? 0);
                    lines.Add(orderline);
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

        public override string ToString() => $"{Product.ProductId}-{Variant?.ProductVariantId.ToString()??"NA"}×{Quantity}";
    }

    /// <summary>
    /// Compares OrderDTOs using the ProductId & VariantId
    /// </summary>
    public class OrderDTOProductAndVariantComparer : IEqualityComparer<OrderDTO>
    {
        public bool Equals(OrderDTO x, OrderDTO y) => x.Product.ProductId == y.Product.ProductId && x.Variant?.ProductVariantId == y.Variant?.ProductVariantId;
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
            new OrderLine
                {
                    ProductId = order.Product.ProductId,
                    ProductVariantId = order.Variant?.ProductVariantId,

                    Product = order.Product,
                    ProductVariant = order.Variant,

                    Price = order.Variant?.Price ?? order.Product.Price,
                    VatPercent = order.Variant?.VatPercent ?? order.Product.VatPercent,
                    Quantity = Math.Max(order.Quantity, order.Product.MinimumQuantity),

                    ProductName = order.Product.Name,
                    ProductDescription = order.Product.Description,

                    ProductVariantName = order.Variant?.Name,
                    ProductVariantDescription = order.Variant?.Description

                    // Comments
                };

    }
}
