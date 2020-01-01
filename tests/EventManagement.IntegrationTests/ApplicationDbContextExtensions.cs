using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using System.Threading.Tasks;

namespace losol.EventManagement.IntegrationTests
{
    public static class ApplicationDbContextExtensions
    {
        public static async Task<IDisposableEntity<Registration>> NewRegistrationAsync(
            this ApplicationDbContext context,
            EventInfo eventInfo,
            ApplicationUser user,
            Registration.RegistrationStatus status = Registration.RegistrationStatus.Verified)
        {
            var registration = new Registration
            {
                EventInfoId = eventInfo.EventInfoId,
                User = user,
                Status = status,
                ParticipantName = user.Name,
                // TODO: add other params
            };
            context.Registrations.Add(registration);
            await context.SaveChangesAsync();
            return new DisposableEntity<Registration>(registration, context);
        }
    }
}
