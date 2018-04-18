using System.Threading.Tasks;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Services.PowerOffice
{
    public interface IPowerOfficeService
    {
        Task CreateInvoiceAsync(Order order);
    }
}