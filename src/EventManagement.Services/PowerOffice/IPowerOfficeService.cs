using System.Threading.Tasks;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Services.PowerOffice
{
    public interface IPowerOfficeService
    {
        void CreateInvoice(Order order);
    }
}