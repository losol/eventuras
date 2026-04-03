using System;
using Eventuras.Domain;

namespace Eventuras.Services.Certificates;

public class CertificateFilter
{
    public int? EventId { get; set; }
    public int? RegistrationId { get; set; }
    public Certificate.CertificateStatus[] Statuses { get; set; }
    public Guid?[] RecipientIds { get; set; }
}
