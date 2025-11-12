using System;
using Eventuras.Domain;
using NodaTime;

namespace Eventuras.WebApi.Controllers.v3.Certificates;

public class CertificateDto
{
    public CertificateDto(Certificate certificate)
    {
        if (certificate == null)
        {
            throw new ArgumentNullException(nameof(certificate));
        }

        CertificateId = certificate.CertificateId;
        CertificateGuid = certificate.CertificateGuid;
        Title = certificate.Title;
        Description = certificate.Description;
        Comment = certificate.Comment;
        RecipientName = certificate.RecipientName;
        EvidenceDescription = certificate.EvidenceDescription;
        IssuedInCity = certificate.IssuedInCity;
        IssuingDate = certificate.IssuedDate;
        IssuerOrganizationName = certificate.IssuingOrganizationName ?? certificate.IssuingOrganization?.Name;
        IssuerOrganizationLogoBase64 = certificate.IssuingOrganization?.LogoBase64;
        IssuerPersonName = certificate.IssuedByName ?? certificate.IssuingUser?.Name;
        IssuerPersonSignatureImageBase64 = certificate.IssuingUser?.SignatureImageBase64;
    }

    public int CertificateId { get; }
    public Guid CertificateGuid { get; }

    public string Title { get; }
    public string Description { get; }
    public string Comment { get; }

    public string RecipientName { get; }

    public string EvidenceDescription { get; }

    public string IssuedInCity { get; }
    public LocalDate IssuingDate { get; }

    public string IssuerOrganizationName { get; }
    public string IssuerOrganizationLogoBase64 { get; }

    public string IssuerPersonName { get; }
    public string IssuerPersonSignatureImageBase64 { get; }
}
