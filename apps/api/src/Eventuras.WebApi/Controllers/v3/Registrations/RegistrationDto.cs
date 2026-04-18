#nullable enable

using System;
using System.Collections.Generic;
using System.Linq;
using Eventuras.Domain;
using Eventuras.Services.Registrations;
using Eventuras.WebApi.Config;
using Eventuras.WebApi.Controllers.v3.Events;
using Eventuras.WebApi.Controllers.v3.Events.Products;
using Eventuras.WebApi.Controllers.v3.Orders;
using Eventuras.WebApi.Controllers.v3.Users;
using NodaTime;
using static Eventuras.Domain.PaymentMethod;

namespace Eventuras.WebApi.Controllers.v3.Registrations;

public class RegistrationDto
{
    [Obsolete("For JSON deserialization only, do not use manually", true)]
    public RegistrationDto() { }

    public RegistrationDto(
        Registration registration,
        IEnumerable<RegistrationProductDto>? products = null,
        bool includeOrders = true)
    {
        RegistrationId = registration.RegistrationId;
        Uuid = registration.Uuid;
        EventId = registration.EventInfoId;
        UserId = registration.UserId;
        Status = registration.Status;
        Type = registration.Type;
        Notes = registration.Notes;
        RegistrationTime = registration.RegistrationTime
            ?.InZone(DisplayTimeZone.Current)
            .LocalDateTime
            .With(TimeAdjusters.TruncateToSecond);
        PaymentMethod = registration.PaymentMethod;
        CertificateComment = registration.CertificateComment;
        CustomerVatNumber = registration.CustomerVatNumber;
        CustomerInvoiceReference = registration.CustomerInvoiceReference;

        if (includeOrders && registration.Orders != null)
        {
            if (products != null)
            {
                // Product is guaranteed non-null by RegistrationProductDto and service layer
                Products = products.Select(p => new ProductOrderDto(
                    p.ProductId,
                    p.ProductVariantId,
                    new ProductDto(p.Product),
                    p.ProductVariant != null ? new ProductVariantDto(p.ProductVariant) : null,
                    p.Quantity
                ));
            }

            Orders = registration.Orders.Select(o => new OrderDto(o));
        }

        if (registration.User != null)
        {
            User = new UserDto(registration.User);
        }

        if (registration.EventInfo != null)
        {
            Event = new EventDto(registration.EventInfo);
        }

        if (registration.CertificateId != null)
        {
            CertificateId = registration.CertificateId;
        }
    }

    public int RegistrationId { get; init; }
    public Guid Uuid { get; init; }
    public int EventId { get; init; }
    public Guid UserId { get; init; }
    public Registration.RegistrationStatus Status { get; init; }
    public Registration.RegistrationType Type { get; init; }
    public int? CertificateId { get; init; }
    public string? CertificateComment { get; init; }
    public string? Notes { get; init; }
    public string? Log { get; set; }
    /// <summary>
    ///     Wall-clock date and time the registration was recorded, in the
    ///     tenant's configured display zone (AppSettings.TimeZone, defaulting
    ///     to Europe/Oslo). Timezone-less on purpose — same model as a flight
    ///     departure time, which is always expressed in the local time of the
    ///     airport regardless of where you view it from. Clients should render
    ///     this string verbatim and not re-parse via <c>new Date()</c> or
    ///     equivalent, which would reinterpret the value in the client's zone.
    /// </summary>
    public LocalDateTime? RegistrationTime { get; init; }
    public PaymentProvider PaymentMethod { get; init; }
    public string? CustomerVatNumber { get; init; }
    public string? CustomerInvoiceReference { get; init; }
    public UserDto? User { get; init; }
    public EventDto? Event { get; init; }
    public IEnumerable<ProductOrderDto>? Products { get; init; }
    public IEnumerable<OrderDto>? Orders { get; init; }

    public void CopyTo(Registration registration)
    {
        if (registration == null)
        {
            throw new ArgumentNullException(nameof(registration));
        }

        registration.Status = Status;
        registration.Type = Type;
        registration.Notes = Notes;
    }
}
