using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace losol.EventManagement.Services.Registrations
{
    internal class RegistrationEnrollmentService : IRegistrationEnrollmentService
    {
        private readonly ApplicationDbContext _applicationDbContext;

        public RegistrationEnrollmentService(ApplicationDbContext applicationDbContext)
        {
            _applicationDbContext = applicationDbContext;
        }

        public async Task EnrollAsync(Registration registration)
        {
            if (registration == null)
            {
                throw new ArgumentNullException(nameof(registration));
            }

            var updatedRegistration =
                await _applicationDbContext.Registrations
                    .FirstOrDefaultAsync(r => r.RegistrationId == registration.RegistrationId);

            if (updatedRegistration == null)
            {
                throw new Exception($"Registration not found: {registration.RegistrationId}"); // TODO: throw some EntityNotFoundException?
            }

            updatedRegistration.EnrolledInLms = true;
            await _applicationDbContext.SaveChangesAsync();
        }
    }
}
