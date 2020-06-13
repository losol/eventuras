using Eventuras.Domain;
using System.Threading.Tasks;

namespace Eventuras.Services.Registrations
{
    public interface IRegistrationEnrollmentService
    {
        Task EnrollAsync(Registration registration);
    }
}
