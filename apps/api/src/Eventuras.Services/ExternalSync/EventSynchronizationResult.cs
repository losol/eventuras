using System;
using System.Collections.Generic;

namespace Eventuras.Services.ExternalSync;

public class EventSynchronizationResult
{
    public EventSynchronizationResult(string providerName)
    {
        if (string.IsNullOrEmpty(providerName))
        {
            throw new ArgumentException(nameof(providerName));
        }

        ProviderName = providerName;
    }

    public string ProviderName { get; }

    public List<Guid> CreatedUserIds { get; } = new();

    public List<Guid> ExistingUserIds { get; } = new();

    public List<Guid> PreviouslyRegisteredUserIds { get; } = new();

    public List<Guid> NewRegisteredUserIds { get; } = new();

    public List<Guid> TotalRegisteredUserIds { get; } = new();


    public List<Exception> GenericErrors { get; } = new();

    public IDictionary<Guid, Exception> UserExportErrors { get; } = new Dictionary<Guid, Exception>();

    public EventSynchronizationResult AddGenericError(Exception e)
    {
        if (e == null)
        {
            throw new ArgumentNullException(nameof(e));
        }

        GenericErrors.Add(e);
        return this;
    }

    public EventSynchronizationResult AddErrorForUser(Guid userId, Exception e)
    {
        if (userId == Guid.Empty)
        {
            throw new ArgumentException("User id must not be empty.", nameof(userId));
        }

        if (e == null)
        {
            throw new ArgumentNullException(nameof(e));
        }

        UserExportErrors.Add(userId, e);
        return this;
    }
}
