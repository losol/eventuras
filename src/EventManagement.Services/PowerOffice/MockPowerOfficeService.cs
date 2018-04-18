using System.Threading.Tasks;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Services.PowerOffice
{
    public class MockPowerOfficeService : IPowerOfficeService
    {
        public void SendInvoice(Order order) { }
    }
}