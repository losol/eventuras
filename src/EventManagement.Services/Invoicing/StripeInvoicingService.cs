using System.Threading.Tasks;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Services.Invoicing
{
    public class StripeInvoicingService : IInvoicingService
    {
        public Task CreateInvoiceAsync(Order order)
        {
            throw new System.NotImplementedException();
        }
    }
}