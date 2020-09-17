using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace Eventuras.Services.ExternalSync
{
    /// <summary>
    /// Manages one external account per user, in contrast
    /// with having one external account per registration.
    /// </summary>
    public abstract class AbstractExternalAccountPerUserSyncProviderService : IExternalSyncProviderService
    {
        public abstract string Name { get; }

        private readonly ApplicationDbContext _context;

        protected AbstractExternalAccountPerUserSyncProviderService(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task SynchronizationCheckAsync(EventInfo eventInfo)
        {
            if (eventInfo == null)
            {
                throw new ArgumentNullException(nameof(eventInfo));
            }

            await EnsureExternalEventAsync(eventInfo);
        }

        public async Task<ExternalAccount> FindExistingAccountAsync(Registration registration)
        {
            if (registration == null)
            {
                throw new ArgumentNullException(nameof(registration));
            }

            return await _context.ExternalAccounts
                .FirstOrDefaultAsync(a => a.ExternalServiceName == Name &&
                                          a.UserId == registration.UserId);
        }

        public async Task<ExternalAccount> CreateAccountForUserAsync(Registration registration)
        {
            if (registration == null)
            {
                throw new ArgumentNullException(nameof(registration));
            }

            if (!registration.Verified)
            {
                throw new InvalidOperationException($"Registration {registration.RegistrationId} is not verified");
            }

            var dto = await CreateNewExternalAccountForRegistrationAsync(registration);

            var externalAccount = new ExternalAccount
            {
                UserId = registration.UserId, // Link external account to user, not to registration, so it can be reused between all registrations
                ExternalServiceName = Name,
                ExternalAccountId = dto.Id,
                DisplayName = dto.Name
            };

            await _context.ExternalAccounts.AddAsync(externalAccount);
            await _context.SaveChangesAsync();
            return externalAccount;
        }

        public async Task<ExternalEventSyncResult> RunSynchronizationAsync(ExternalAccount account, Registration registration)
        {
            if (account == null)
            {
                throw new ArgumentException(nameof(account));
            }

            if (registration == null)
            {
                throw new ArgumentException(nameof(registration));
            }

            if (registration.EventInfo == null)
            {
                throw new ArgumentException(nameof(registration));
            }

            var externalEvent = await EnsureExternalEventAsync(registration.EventInfo);
            if (externalEvent == null)
            {
                return ExternalEventSyncResult.NotSynced;
            }

            if (await _context.ExternalRegistrations
                .AnyAsync(e => e.ExternalEventId == externalEvent.LocalId &&
                               e.ExternalAccountId == account.LocalId))
            {
                return ExternalEventSyncResult.AlreadySynced;
            }

            await RegisterUserToExternalEventAsync(account, externalEvent);

            try
            {
                var externalRegistration = new ExternalRegistration
                {
                    ExternalEvent = externalEvent,
                    ExternalAccount = account,
                    Registration = registration
                };

                await _context.ExternalRegistrations.AddAsync(externalRegistration);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException e) when (e.IsUniqueKeyViolation())
            {
                return ExternalEventSyncResult.AlreadySynced;
            }

            return ExternalEventSyncResult.Synced;
        }

        protected abstract Task<ExternalAccountDto> CreateNewExternalAccountForRegistrationAsync(Registration registration);

        protected abstract Task RegisterUserToExternalEventAsync(ExternalAccount account, ExternalEvent externalEvent);

        protected virtual async Task<ExternalEvent> EnsureExternalEventAsync(EventInfo eventInfo)
        {
            var externalEvent = await _context.ExternalEvents.FirstOrDefaultAsync(
                c => c.ExternalServiceName == Name &&
                     c.EventInfoId == eventInfo.EventInfoId);

            if (externalEvent == null)
            {
                throw new ExternalEventNotFoundException($"No external events configured for event {eventInfo.Title}");
            }

            return externalEvent;
        }
    }

    public class ExternalAccountDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
    }
}
