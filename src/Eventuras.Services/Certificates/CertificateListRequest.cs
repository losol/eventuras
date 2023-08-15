namespace Eventuras.Services.Certificates;

public class CertificateListRequest : PagingRequest
{
    public CertificateFilter Filter { get; set; } = new();

    public CertificateListOrder ListOrder { get; set; } = CertificateListOrder.Issued;

    public bool Descending { get; set; }
}