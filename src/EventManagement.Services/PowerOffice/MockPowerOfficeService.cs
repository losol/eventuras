using System.Threading.Tasks;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Services.PowerOffice
{
    public class MockPowerOfficeService : IPowerOfficeService
    {
        public async Task CreateInvoiceAsync(Order order) => await Task.FromResult(0);
    }
}