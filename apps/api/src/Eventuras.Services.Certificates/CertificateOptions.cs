#nullable enable

namespace Eventuras.Services.Certificates;

public sealed class CertificateOptions
{
    public const string SectionName = "Certificates";

    public string DefaultLocale { get; set; } = "nb-NO";
}
