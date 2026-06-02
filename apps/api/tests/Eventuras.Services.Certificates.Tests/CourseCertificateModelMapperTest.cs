#nullable enable

using System;
using Eventuras.Domain;
using Eventuras.Services.Certificates;
using NodaTime;
using Xunit;

namespace Eventuras.Services.Certificates.Tests;

public class CourseCertificateModelMapperTest
{
    private static CertificateViewModel CreateViewModel(Action<Certificate>? customize = null)
    {
        var certificate = new Certificate
        {
            Uuid = Guid.Parse("01234567-89ab-7cde-9012-3456789abcde"),
            Title = "Avansert Fluid-templating",
            Description = "Et omfattende kurs",
            Comment = "Gjennomført med stort engasjement",
            RecipientName = "Leo Losen",
            EvidenceDescription = "Workshop på Eventuras 2026",
            IssuingOrganizationName = "Eventuras AS",
            IssuedByName = "Kursansvarlig Hansen",
            IssuedInCity = "Oslo",
            IssuedDate = new LocalDate(2026, 5, 15)
        };
        customize?.Invoke(certificate);
        return new CertificateViewModel(certificate);
    }

    [Fact]
    public void FromViewModel_CopiesAllPlainStringFields()
    {
        var viewModel = CreateViewModel();

        var model = CourseCertificateModelMapper.FromViewModel(viewModel, "nb");

        Assert.Equal("Avansert Fluid-templating", model.Title);
        Assert.Equal("Leo Losen", model.RecipientName);
        Assert.Equal("Workshop på Eventuras 2026", model.EvidenceDescription);
        Assert.Equal("Gjennomført med stort engasjement", model.Comment);
        Assert.Equal("Et omfattende kurs", model.Description);
        Assert.Equal("Eventuras AS", model.IssuerOrganizationName);
        Assert.Equal("Oslo", model.IssuedInCity);
        Assert.Equal("Kursansvarlig Hansen", model.IssuerPersonName);
        Assert.Equal("01234567-89ab-7cde-9012-3456789abcde", model.Uuid);
    }

    [Fact]
    public void FromViewModel_FormatsDate_UsingNorwegianCulture_ForNo()
    {
        var viewModel = CreateViewModel();

        var model = CourseCertificateModelMapper.FromViewModel(viewModel, "nb");

        Assert.Equal("15.05.2026", model.IssuedDate);
    }

    [Fact]
    public void FromViewModel_FormatsDate_UsingEnglishCulture_ForEn()
    {
        var viewModel = CreateViewModel();

        var model = CourseCertificateModelMapper.FromViewModel(viewModel, "en");

        Assert.Equal("15.05.2026", model.IssuedDate);
    }

    [Fact]
    public void FromViewModel_ReturnsEmptyStrings_ForNullRequiredFields()
    {
        var viewModel = CreateViewModel(c =>
        {
            c.Title = null!;
            c.RecipientName = null!;
            c.IssuedInCity = null!;
            c.IssuedByName = null!;
        });

        var model = CourseCertificateModelMapper.FromViewModel(viewModel, "nb");

        Assert.Equal(string.Empty, model.Title);
        Assert.Equal(string.Empty, model.RecipientName);
        Assert.Equal(string.Empty, model.IssuedInCity);
        Assert.Equal(string.Empty, model.IssuerPersonName);
    }

    [Fact]
    public void FromViewModel_PassesThroughNulls_ForOptionalFields()
    {
        var viewModel = CreateViewModel(c =>
        {
            c.EvidenceDescription = null;
            c.Comment = null;
            c.Description = null;
            c.IssuingOrganizationName = null;
        });

        var model = CourseCertificateModelMapper.FromViewModel(viewModel, "nb");

        Assert.Null(model.EvidenceDescription);
        Assert.Null(model.Comment);
        Assert.Null(model.Description);
        Assert.Null(model.IssuerOrganizationName);
        Assert.Null(model.IssuerOrganizationLogoDataUri);
        Assert.Null(model.IssuerPersonSignatureDataUri);
    }

    [Fact]
    public void FromViewModel_Throws_WhenViewModelIsNull()
    {
        Assert.Throws<ArgumentNullException>(() =>
            CourseCertificateModelMapper.FromViewModel(null!, "nb"));
    }

    [Fact]
    public void FromViewModel_Throws_WhenLocaleIsWhitespace()
    {
        var viewModel = CreateViewModel();

        Assert.Throws<ArgumentException>(() =>
            CourseCertificateModelMapper.FromViewModel(viewModel, "  "));
    }
}
