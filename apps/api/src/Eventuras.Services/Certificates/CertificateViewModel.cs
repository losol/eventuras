using System;
using Eventuras.Domain;
using NodaTime;

namespace Eventuras.Services.Certificates;

public class CertificateViewModel
{
    public CertificateViewModel(EventInfo eventInfo) : this(eventInfo.FillCertificate(new Certificate
    {
        RecipientName = "Gerhard Henrik Armauer Hansen",
        Comment = "Eventuell tekst som er skrevet som kommentar på deltakers registrering kommer her",
        CertificateGuid = Guid.NewGuid(),
        IssuedDate = SystemClock.Instance.Today()
    }))
    {
    }

    public CertificateViewModel(Certificate certificate)
    {
        if (certificate == null)
        {
            throw new ArgumentNullException(nameof(certificate));
        }

        CertificateGuid = certificate.CertificateGuid;

        Title = certificate.Title;
        Description = certificate.Description;
        Comment = certificate.Comment;

        RecipientName = certificate.RecipientName;
        EvidenceDescription = certificate.EvidenceDescription;
        IssuedInCity = certificate.IssuedInCity;
        IssuingDate = certificate.IssuedDate;

        IssuerOrganizationName = certificate.IssuingOrganization?.Name ?? certificate.IssuingOrganizationName;
        IssuerOrganizationLogoBase64 = certificate.IssuingOrganization?.LogoBase64;

        IssuerPersonName = certificate.IssuingUser?.Name ?? certificate.IssuedByName;
        IssuerPersonSignatureImageBase64 = certificate.IssuingUser?.SignatureImageBase64;
    }

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
