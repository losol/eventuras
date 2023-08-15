namespace Eventuras.Domain;

public class SmsNotification : Notification
{
    private SmsNotification() { }

    public SmsNotification(string message) : base(message) { }
}