using System.Threading.Tasks;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Services.Invoicing
{
    public interface IPowerOfficeService
    {
        Task<bool> CreateInvoiceAsync(Order order);
    }
}