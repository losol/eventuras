using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Invoicing
{
    public class MockInvoicingService : IInvoicingService, IPowerOfficeService, IStripeInvoiceService
    {
        public async Task<bool> CreateInvoiceAsync(Order order) => await Task.FromResult(true);
    }
}