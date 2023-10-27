using Eventuras.Domain;
using NodaTime;
using System;

namespace Eventuras.WebApi.Controllers.v4.Notifications
{
    public class NotificationRecipientDto
    {
        public int RecipientId { get; }

        public int NotificationId { get; }

        public string RecipientUserId { get; }

        public int? RegistrationId { get; }

        public string RecipientName { get; }

        public string RecipientIdentifier { get; }

        public Instant Created { get; }

        public Instant? Sent { get; }

        public string Errors { get; }

        public NotificationRecipientDto(NotificationRecipient recipient)
        {
            if (recipient == null)
            {
                throw new ArgumentNullException(nameof(recipient));
            }

            RecipientId = recipient.RecipientId;
            NotificationId = recipient.NotificationId;
            RecipientUserId = recipient.RecipientUserId;
            RegistrationId = recipient.RegistrationId;
            RecipientName = recipient.RecipientName;
            RecipientIdentifier = recipient.RecipientIdentifier;
            Created = recipient.Created;
            Sent = recipient.Sent;
            Errors = recipient.Errors;
        }
    }
}
