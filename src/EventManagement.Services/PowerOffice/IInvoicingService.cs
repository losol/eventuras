using System.Threading.Tasks;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Services.PowerOffice
{
    public interface IInvoicingService
    {
        Task CreateInvoiceAsync(Order order);
    }
}