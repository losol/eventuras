using losol.EventManagement.Domain;
using System.Threading.Tasks;

namespace losol.EventManagement.Services.Registrations
{
    public interface IRegistrationEnrollmentService
    {
        Task EnrollAsync(Registration registration);
    }
}
