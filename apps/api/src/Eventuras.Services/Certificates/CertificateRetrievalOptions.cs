namespace Eventuras.Services.Certificates;

public class CertificateRetrievalOptions
{
    public bool ForUpdate { get; set; }
    public bool LoadIssuingUser { get; set; }
    public bool LoadIssuingOrganization { get; set; }
    public bool LoadRecipientUser { get; set; }

    public static readonly CertificateRetrievalOptions ForRendering = new()
    {
        LoadIssuingUser = true,
        LoadIssuingOrganization = true
    };
}
