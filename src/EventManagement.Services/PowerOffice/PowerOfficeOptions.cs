using static GoApi.Global.Settings;

namespace losol.EventManagement.Services.PowerOffice
{
    public class PowerOfficeOptions
    {
        public string ApplicationKey { get; set; }
        public string ClientKey { get; set; }
        public EndPointMode Mode { get; set; }
    }
}
