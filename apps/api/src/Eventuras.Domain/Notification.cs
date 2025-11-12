using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NodaTime;

namespace Eventuras.Domain;

public abstract class Notification
{
    private NotificationStatus _status = NotificationStatus.New;

    protected Notification()
    {
    }

    protected Notification(string message)
    {
        if (string.IsNullOrWhiteSpace(message))
        {
            throw new ArgumentException($"{nameof(message)} must not be empty");
        }

        Message = message;
        Created = SystemClock.Instance.Now();
    }

    [Required]
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int NotificationId { get; set; }

    public int? OrganizationId { get; set; }

    public int? EventInfoId { get; set; }

    public int? ProductId { get; set; }

    [Required] public string CreatedByUserId { get; set; }

    /// <summary>
    ///     Full message body.
    /// </summary>
    [Required]
    public string Message { get; private set; }

    public Instant Created { get; private set; }

    public Instant StatusUpdated { get; private set; }

    public NotificationType Type { get; private set; }

    public NotificationStatus Status
    {
        get => _status;
        set
        {
            _status = value;
            StatusUpdated = SystemClock.Instance.Now();
        }
    }

    [ForeignKey(nameof(OrganizationId))] public Organization Organization { get; set; }

    [ForeignKey(nameof(EventInfoId))] public EventInfo EventInfo { get; set; }

    [ForeignKey(nameof(ProductId))] public Product Product { get; set; }

    [ForeignKey(nameof(CreatedByUserId))] public ApplicationUser CreatedByUser { get; set; }

    public IReadOnlyList<NotificationRecipient> Recipients { get; set; }

    public NotificationStatistics Statistics { get; set; }
}

public enum NotificationStatus
{
    New = 1,
    Queued,
    Started,
    Cancelled,
    Failed,
    Sent
}
