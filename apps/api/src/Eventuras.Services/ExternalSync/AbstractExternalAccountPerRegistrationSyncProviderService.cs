using System;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.ExternalSync;

/// <summary>
///     Manages one external account per single event registration. Which means,
///     that every user registered in the system may have multiple external accounts
///     linked to different event registrations.
/// </summary>
public abstract class AbstractExternalAccountPerRegistrationSyncProviderService : AbstractExternalSyncProviderService
{
    private readonly ApplicationDbContext _context;

    protected AbstractExternalAccountPerRegistrationSyncProviderService(ApplicationDbContext context, ILogger logger) :
        base(context, logger) => _context = context ?? throw new ArgumentNullException(nameof(context));

    public override async Task<ExternalAccount> FindExistingAccountAsync(Registration registration)
    {
        if (registration == null)
        {
            throw new ArgumentNullException(nameof(registration));
        }

        return await _context.ExternalAccounts
            .FirstOrDefaultAsync(a => a.ExternalServiceName == Name &&
                                      a.RegistrationId == registration.RegistrationId);
    }
}
