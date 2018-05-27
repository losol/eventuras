using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
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
            var existingProductIds = Orders.Where(o => o.Status != OrderStatus.Cancelled && o.Status != OrderStatus.Refunded)
                                        .SelectMany(o => o.OrderLines
                                            .Where(l => l.ProductId.HasValue))
                                        .Select(l => l.ProductId.Value);

            // Check if an orderline needs to be updated
            var conflictingProductIds = existingProductIds.Intersect(orders.Select(p => p.Product.ProductId));

            // If a refund is required
            var refundLines = new List<OrderLine>();
            if (conflictingProductIds.Any())
            {
                var linesToRefund = Orders.SelectMany(o => o.OrderLines)
                                        .Where(l => l.ProductId.HasValue && !l.IsRefund && conflictingProductIds.Contains(l.ProductId.Value));

                // Refund the orders, and create refundlines for each of them
                foreach (var l in linesToRefund)
                {
                    refundLines.Add(l.CreateRefundOrderLine());
                }
            }

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
            orderLines.Concat(refundlines);
            return orderLines.ToList();
        }
    }

    public class OrderDTO
    {
        public Product Product { get; set; }
        public ProductVariant Variant { get; set; }
        public int Quantity { get; set; } = 1; // FIXME: Should default to Product.MinimumQuantity
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
