#nullable enable

namespace Eventuras.Services.Certificates;

public sealed record CertificateDeliveryEmailModel(
    string Title,
    string RecipientName);
