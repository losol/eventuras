using GoApi.Core.Global;

namespace Eventuras.Services.PowerOffice;

public class PowerOfficeOptions
{
    public string ApplicationKey { get; set; }

    public string ClientKey { get; set; }

    public Settings.EndPointMode Mode { get; set; }

    public string TokenStoreName { get; set; }
}