#nullable enable

using System;
using System.Collections.Generic;
using System.Linq;
using DocumentFormat.OpenXml.Drawing.Charts;
using Eventuras.Domain;
using Eventuras.WebApi.Controllers.v3.Events;
using Eventuras.WebApi.Controllers.v3.Events.Products;
using Eventuras.WebApi.Controllers.v3.Orders;
using Eventuras.WebApi.Controllers.v3.Users;

namespace Eventuras.WebApi.Controllers.v3.Registrations;

public class RegistrationDto
{
    public int RegistrationId { get; init; }
    public int EventId { get; init; }
    public string UserId { get; init; }
    public Registration.RegistrationStatus Status { get; init; }
    public Registration.RegistrationType Type { get; init; }
    public int? CertificateId { get; init; }
    public string? Notes { get; init; }
    public string? Log { get; set; }
    public UserDto? User { get; init; }
    public EventDto? Event { get; init; }
    public IEnumerable<ProductOrderDto>? Products { get; init; }
    public IEnumerable<OrderDto>? Orders { get; init; }

    [Obsolete("For JSON deserialization only, do not use manually", true)]
    public RegistrationDto()
    {
        UserId = null!;
    }

    public RegistrationDto(
        Registration registration,
        IEnumerable<Eventuras.Services.Registrations.RegistrationProductDto>? products = null,
        bool includeOrders = true)
    {
        RegistrationId = registration.RegistrationId;
        EventId = registration.EventInfoId;
        UserId = registration.UserId;
        Status = registration.Status;
        Type = registration.Type;
        Notes = registration.Notes;
        Log = registration.Log;

        if (includeOrders && registration.Orders != null)
        {
            if (products != null)
            {
                Products = products.Select(p => new ProductOrderDto(
                    p.ProductId,
                    p.ProductVariantId,
                    p.Product != null ? new ProductDto(p.Product) : null!,
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

    public void CopyTo(Registration registration)
    {
        if (registration == null)
        { throw new ArgumentNullException(nameof(registration)); }

        registration.Status = Status;
        registration.Type = Type;
        registration.Notes = Notes;
    }
}
