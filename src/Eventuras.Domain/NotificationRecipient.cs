using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Net.Mail;

namespace Eventuras.Domain
{
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
        public string RecipientIdentifier { get; private set; }

        public DateTime Created { get; private set; }

        public DateTime? Sent { get; set; }

        public string Errors { get; set; }

        [NotMapped] public bool IsSent => Sent.HasValue;

        [NotMapped] public bool HasErrors => !string.IsNullOrEmpty(Errors);

        [ForeignKey(nameof(NotificationId))] public Notification Notification { get; set; }

        [ForeignKey(nameof(RecipientUserId))] public ApplicationUser RecipientUser { get; set; }

        [ForeignKey(nameof(RegistrationId))] public Registration Registration { get; set; }

        internal NotificationRecipient()
        {
        }

        public NotificationRecipient(string recipientIdentifier)
        {
            if (recipientIdentifier == null)
            {
                throw new ArgumentNullException(nameof(recipientIdentifier));
            }

            if (!MailAddress.TryCreate(recipientIdentifier, out var address))
            {
                throw new ArgumentException($"Invalid email address: {recipientIdentifier}");
            }

            RecipientIdentifier = address.Address;
            RecipientName = address.DisplayName;
            Created = DateTime.Now;
        }

        public NotificationRecipient(ApplicationUser recipientUser) : this(recipientUser.Email)
        {
            RecipientUser = recipientUser;
            RecipientName = recipientUser.Name;
        }

        public NotificationRecipient(Registration registration) : this(registration.User)
        {
            Registration = registration;
            RecipientName = registration.ParticipantName ?? registration.User.Name;
        }
    }
}
