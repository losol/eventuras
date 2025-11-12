using System;
using System.ComponentModel.DataAnnotations;

namespace Eventuras.Domain;

public class EmailNotification : Notification
{
    private EmailNotification()
    {
    }

    public EmailNotification(string subject, string body) : base(body)
    {
        if (string.IsNullOrWhiteSpace(subject))
        {
            throw new ArgumentException($"{nameof(subject)} must not be empty");
        }

        if (string.IsNullOrWhiteSpace(body))
        {
            throw new ArgumentException($"{nameof(body)} must not be empty");
        }

        Subject = subject;
    }

    [Required] public string Subject { get; private set; }
}
