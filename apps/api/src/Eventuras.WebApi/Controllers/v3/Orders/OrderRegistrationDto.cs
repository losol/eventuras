#nullable enable

using System;
using Eventuras.Domain;

namespace Eventuras.WebApi.Controllers.v3.Orders;

public class OrderRegistrationDto
{
    [Obsolete("For JSON deserialization only, do not use manually", true)]
    public OrderRegistrationDto() { }

    public OrderRegistrationDto(Registration registration)
    {
        RegistrationId = registration.RegistrationId;
        EventId = registration.EventInfoId;
        UserId = registration.UserId;
        Status = registration.Status;
        CertificateId = registration.CertificateId;
        Type = registration.Type;
        Notes = registration.Notes;
    }

    public int RegistrationId { get; set; }
    public int EventId { get; set; }
    public string? UserId { get; set; }
    public Registration.RegistrationStatus Status { get; set; }
    public Registration.RegistrationType Type { get; set; }
    public int? CertificateId { get; set; }
    public string? Notes { get; set; }
}
