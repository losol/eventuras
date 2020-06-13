using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Invoicing
{
    public interface IInvoicingService
    {
        Task<bool> CreateInvoiceAsync(Order order);
    }
}