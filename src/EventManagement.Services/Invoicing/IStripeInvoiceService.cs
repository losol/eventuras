using System.Threading.Tasks;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Services.Invoicing
{
    public interface IStripeInvoiceService
    {
        Task<bool> CreateInvoiceAsync(Order order);
    }
}