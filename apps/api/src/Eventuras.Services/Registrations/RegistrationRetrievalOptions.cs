namespace Eventuras.Services.Registrations;

public class RegistrationRetrievalOptions
{
    /// <summary>
    ///     Just a helpful shortcut for retrieving registrations
    ///     with user and event info loaded.
    /// </summary>
    public static readonly RegistrationRetrievalOptions UserAndEvent = new() { LoadUser = true, LoadEventInfo = true };

    public static readonly RegistrationRetrievalOptions RegistrationInfoOnly = new();

    public static readonly RegistrationRetrievalOptions Default = RegistrationInfoOnly;

    public static readonly RegistrationRetrievalOptions ForCertificateIssuing = new()
    {
        ForUpdate = true,
        LoadCertificate = true,
        LoadUser = true,
        LoadEventInfo = true,
        LoadEventOrganization = true,
        LoadEventOrganizer = true
    };

    public static readonly RegistrationRetrievalOptions ForCertificateRendering = new() { LoadCertificate = true };

    public bool ForUpdate { get; set; }
    public bool LoadUser { get; set; }
    public bool LoadEventInfo { get; set; }
    public bool LoadEventOrganization { get; set; }
    public bool LoadEventOrganizer { get; set; }
    public bool LoadOrders { get; set; }
    public bool LoadProducts { get; set; }
    public bool LoadCertificate { get; set; }
}
