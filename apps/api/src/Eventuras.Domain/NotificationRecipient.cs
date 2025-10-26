using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Net.Mail;
using NodaTime;

namespace Eventuras.Domain;

public class NotificationRecipient
{
    [Required]
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int RecipientId { get; set; }

    public int NotificationId { get; set; }

    /// <summary>
    /// Optional reference to the recipient application user.
    /// </summary>
    public string RecipientUserId { get; set; }

    /// <summary>
    /// Optional event registration reference.
    /// </summary>
    public int? RegistrationId { get; set; }

    public string RecipientName { get; private set; }

    /// <summary>
    /// The phone number or email address which the notification is sent to.
    /// </summary>
    [Required]
    public string RecipientIdentifier { get; private set; }

    public Instant Created { get; private set; }

    public Instant? Sent { get; set; }

    public string Errors { get; set; }

    [NotMapped] public bool IsSent => Sent.HasValue;

    [NotMapped] public bool HasErrors => !string.IsNullOrEmpty(Errors);

    [ForeignKey(nameof(NotificationId))] public Notification Notification { get; set; }

    [ForeignKey(nameof(RecipientUserId))] public ApplicationUser RecipientUser { get; set; }

    [ForeignKey(nameof(RegistrationId))] public Registration Registration { get; set; }

    private NotificationRecipient()
    {
    }

    private NotificationRecipient(string recipientIdentifier, NotificationType notificationType)
    {
        if (recipientIdentifier == null)
        {
            throw new ArgumentNullException(nameof(recipientIdentifier));
        }

        Created = SystemClock.Instance.Now();

        if (notificationType == NotificationType.Email)
        {
            if (!MailAddress.TryCreate(recipientIdentifier, out var address))
            {
                throw new ArgumentException($"Invalid email address: {recipientIdentifier}");
            }

            RecipientIdentifier = address.Address;
            RecipientName = address.DisplayName;
        }
        else
        {
            RecipientIdentifier = recipientIdentifier;
        }
    }

    public static NotificationRecipient Create(ApplicationUser recipientUser, NotificationType notificationType)
    {
        var identifier = notificationType switch
        {
            NotificationType.Email => recipientUser.Email,
            NotificationType.Sms => recipientUser.PhoneNumber,
            _ => null
        };

        if (string.IsNullOrEmpty(identifier))
        {
            return null;
        }

        return new NotificationRecipient(identifier, notificationType)
        {
            RecipientUser = recipientUser,
            RecipientName = recipientUser.Name
        };
    }

    public static NotificationRecipient Create(Registration registration, NotificationType notificationType)
    {
        var recipient = Create(registration.User, notificationType);
        if (recipient != null)
        {
            recipient.RecipientName = registration.User.Name;
        }

        return recipient;
    }

    public static NotificationRecipient Email(string address)
    {
        if (string.IsNullOrEmpty(address))
        {
            throw new ArgumentException($"{nameof(address)} must not be empty");
        }

        return new NotificationRecipient(address, NotificationType.Email);
    }

    public static NotificationRecipient Email(ApplicationUser user)
    {
        return Create(user, NotificationType.Email);
    }

    public static NotificationRecipient Email(Registration registration)
    {
        return Create(registration, NotificationType.Email);
    }

    public static NotificationRecipient Sms(string phoneNumber)
    {
        if (string.IsNullOrEmpty(phoneNumber))
        {
            throw new ArgumentException($"{nameof(phoneNumber)} must not be empty");
        }

        return new NotificationRecipient(phoneNumber, NotificationType.Sms);
    }

    public static NotificationRecipient Sms(ApplicationUser recipientUser)
    {
        return Create(recipientUser, NotificationType.Sms);
    }

    public static NotificationRecipient Sms(Registration registration)
    {
        return Create(registration, NotificationType.Sms);
    }
}
