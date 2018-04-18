using Microsoft.Extensions.Options;

namespace losol.EventManagement.Services.PowerOffice
{
    public class PowerOfficeService : IPowerOfficeService
    {
        public PowerOfficeService(IOptions<PowerOfficeOptions> options)
        {

        }       
    }
}