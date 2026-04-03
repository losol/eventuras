#nullable enable

using System;

using Eventuras.Domain;

namespace Eventuras.Services.BusinessEvents;

public interface IBusinessEventService
{
    void AddEvent(
        BusinessEventSubject subject,
        string eventType,
        string message,
        Guid? actorUserUuid = null,
        object? metadata = null);
}
