namespace Eventuras.Services.Notifications;

public enum NotificationRecipientListOrder
{
    /// <summary>
    ///     Sort by creation date and time.
    /// </summary>
    Created = 1,

    /// <summary>
    ///     Sort by delivery date and time.
    /// </summary>
    Sent,

    /// <summary>
    ///     Sort by recipient name.
    /// </summary>
    Name,

    /// <summary>
    ///     Sort by email, or phone number.
    /// </summary>
    Identifier
}
