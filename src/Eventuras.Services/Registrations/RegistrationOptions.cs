namespace Eventuras.Services.Registrations;

public class RegistrationOptions
{
    /// <summary>
    /// Create an order with all mandatory products included.
    /// </summary>
    public bool CreateOrder { get; set; }

    /// <summary>
    /// Send a welcome letter to the user.
    /// </summary>
    public bool SendWelcomeLetter { get; set; } = true;
}