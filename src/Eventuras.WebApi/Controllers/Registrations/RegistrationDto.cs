#nullable enable

using System;
using System.Collections.Generic;
using System.Linq;
using Eventuras.Domain;
using Eventuras.WebApi.Controllers.Events;
using Eventuras.WebApi.Controllers.Events.Products;
using Eventuras.WebApi.Controllers.Orders;
using Eventuras.WebApi.Controllers.Users;

namespace Eventuras.WebApi.Controllers.Registrations
{
    public class RegistrationDto
    {
        public int RegistrationId { get; init; }
        public int EventId { get; init; }
        public string UserId { get; init; }
        public Registration.RegistrationStatus Status { get; init; }
        public Registration.RegistrationType Type { get; init; }
        public int? CertificateId { get; init; }
        public string? Notes { get; init; }
        public UserDto? User { get; init; }
        public EventDto? Event { get; init; }
        public IEnumerable<ProductOrderDto>? Products { get; init; }
        public IEnumerable<OrderDto>? Orders { get; init; }

        [Obsolete("For JSON deserialization only, do not use manually", true)]
        public RegistrationDto()
        {
            UserId = null!;
        }

        public RegistrationDto(Registration registration)
        {
            RegistrationId = registration.RegistrationId;
            EventId = registration.EventInfoId;
            UserId = registration.UserId;
            Status = registration.Status;
            Type = registration.Type;
            Notes = registration.Notes;

            if (registration.Orders != null)
            {
                Products = registration.Products.Select(ProductOrderDto.FromRegistrationOrderDto);
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
        }
    }
}