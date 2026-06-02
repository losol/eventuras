#nullable enable

using System;
using System.Globalization;
using NodaTime.Text;

namespace Eventuras.Services.Certificates;

public static class CourseCertificateModelMapper
{
    public static CourseCertificateModel FromViewModel(CertificateViewModel viewModel, string locale)
    {
        ArgumentNullException.ThrowIfNull(viewModel);
        ArgumentException.ThrowIfNullOrWhiteSpace(locale);

        var culture = MapLocaleToCulture(locale);
        var datePattern = LocalDatePattern.Create("dd.MM.yyyy", culture);

        return new CourseCertificateModel(
            Title: viewModel.Title ?? string.Empty,
            RecipientName: viewModel.RecipientName ?? string.Empty,
            EvidenceDescription: viewModel.EvidenceDescription,
            Comment: viewModel.Comment,
            Description: viewModel.Description,
            IssuerOrganizationName: viewModel.IssuerOrganizationName,
            IssuerOrganizationLogoDataUri: viewModel.IssuerOrganizationLogoBase64,
            IssuedInCity: viewModel.IssuedInCity ?? string.Empty,
            IssuedDate: datePattern.Format(viewModel.IssuingDate),
            IssuerPersonSignatureDataUri: viewModel.IssuerPersonSignatureImageBase64,
            IssuerPersonName: viewModel.IssuerPersonName ?? string.Empty,
            Uuid: viewModel.Uuid.ToString());
    }

    private static CultureInfo MapLocaleToCulture(string locale)
    {
        try
        {
            return CultureInfo.GetCultureInfo(locale);
        }
        catch (CultureNotFoundException)
        {
            return CultureInfo.InvariantCulture;
        }
    }
}
