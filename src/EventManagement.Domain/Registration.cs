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
        public List<OrderDTO> Products
        {
            get {
                var validOrders = Orders.Where(o => o.Status != OrderStatus.Cancelled && o.Status != OrderStatus.Refunded);
                var productOrderLines = validOrders.SelectMany(o => o.OrderLines)
                    .Select(l => new { product = l.Product, variant = l.ProductVariant, quantity = l.Quantity });
                return productOrderLines
                    .GroupBy(l => new { l.product, l.variant })
                    .Select(g => new OrderDTO { Product = g.Key.product, Variant = g.Key.variant, Quantity = g.Sum(t => t.quantity ) })
                    .Where(p => p.Quantity > 0)
                    .ToList();
            }
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
        public void CreateOrUpdateOrder(ICollection<OrderDTO> orders)
        {
            // Get the existing productids
            var products = Products;

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
                            Price = order.Product.Price,
                            Quantity = order.Quantity - p.Quantity,
                            VatPercent = order.Product.VatPercent,
                            ProductId = order.Product.ProductId,
                            ProductVariantId = order.Variant.ProductVariantId,
                            Product = order.Product,
                            ProductVariant = order.Variant
                        };
                        refundLines.Add(orderline);
                        refundDtos.Add(order);
                    }
                }
            }

            refundDtos.ForEach(dto => orders.Remove(dto));
            refundDtos = null;

            // Check if any editable orders exist
            var editableOrders = Orders.Where(o => o.Status != OrderStatus.Invoiced && o.Status != OrderStatus.Cancelled && o.Status != OrderStatus.Refunded);

            if (!editableOrders.Any())
            {
                // Create a new order
                CreateOrder(orders, refundLines);
            }
            else
            {
                var orderToUpdate = editableOrders.First();
                orderToUpdate.OrderLines.AddRange(_createOrderLines(orders, refundLines));
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
    }

    /// <summary>
    /// Compares OrderDTOs using the ProductId & VariantId
    /// </summary>
    public class OrderDTOProductAndVariantComparer : IEqualityComparer<OrderDTO>
    {
        public bool Equals(OrderDTO x, OrderDTO y) => x.Product.ProductId == y.Product.ProductId && x.Variant?.ProductVariantId == y.Variant?.ProductVariantId;
        public int GetHashCode(OrderDTO obj) => obj.Product.ProductId;
    }

    public static class OrderDTOExtensions
    {
        public static List<OrderLine> ToOrderLines(this IEnumerable<OrderDTO> orders)
        {
            return orders.Where(o => o.Quantity != 0).Select(p =>
                new OrderLine
                {
                    ProductId = p.Product.ProductId,
                    ProductVariantId = p.Variant?.ProductVariantId,
                    Price = p.Variant?.Price ?? p.Product.Price,
                    VatPercent = p.Variant?.VatPercent ?? p.Product.VatPercent,
                    Quantity = Math.Max(p.Quantity, p.Product.MinimumQuantity),

                    ProductName = p.Product.Name,
                    ProductDescription = p.Product.Description,

                    ProductVariantName = p.Variant?.Name,
                    ProductVariantDescription = p.Variant?.Description

                    // Comments
                }
            ).ToList();
        }
    }
}
