namespace Eventuras.Services.Registrations;

public class RegistrationOptions
{
    /// <summary>
    ///     Create an order with all mandatory products included.
    /// </summary>
    public bool CreateOrder { get; set; }

    /// <summary>
    ///     Sets the registration as verified.
    /// </summary>
    public bool Verified { get; set; }

    /// <summary>
    ///     Refuse the registration if the event has already reached
    ///     <see cref="Domain.EventInfo.MaxParticipants" />. Admin flows that
    ///     need to override capacity (manual overbooking) can set this to
    ///     false; self-service registrations keep it true.
    /// </summary>
    public bool EnforceCapacity { get; set; } = true;
}
