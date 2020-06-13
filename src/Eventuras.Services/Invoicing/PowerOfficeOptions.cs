using static GoApi.Global.Settings;

namespace Eventuras.Services.Invoicing
{
    public class PowerOfficeOptions
    {
        public string ApplicationKey { get; set; }
        public string ClientKey { get; set; }
        public EndPointMode Mode { get; set; }
        public string TokenStoreName { get; set; }
    }
}
