#nullable enable

namespace Eventuras.Domain;

public class EventInfoOptions
{
    public EventInfoRegistrationPolicy RegistrationPolicy { get; set; } = new();

    public class EventInfoRegistrationPolicy
    {
        public int? AllowedRegistrationEditHours { get; set; } = 24;
        public bool AllowModificationsAfterLastCancellationDate { get; set; } = false;
    }
}