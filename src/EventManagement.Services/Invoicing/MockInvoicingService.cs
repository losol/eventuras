using System.Threading.Tasks;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Services.Invoicing
{
    public class MockInvoicingService : IInvoicingService
    {
        public async Task CreateInvoiceAsync(Order order) => await Task.FromResult(0);
    }
}