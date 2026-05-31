#nullable enable

namespace Eventuras.Services.Certificates;

public sealed record CourseCertificateModel(
    string Title,
    string RecipientName,
    string? EvidenceDescription,
    string? Comment,
    string? Description,
    string? IssuerOrganizationName,
    string? IssuerOrganizationLogoDataUri,
    string IssuedInCity,
    string IssuedDate,
    string? IssuerPersonSignatureDataUri,
    string IssuerPersonName,
    string Uuid);
