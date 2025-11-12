using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Eventuras.Domain;

public class NotificationStatistics
{
    public NotificationStatistics()
    {
    }

    public NotificationStatistics(Notification notification) =>
        Notification = notification ?? throw new ArgumentNullException(nameof(notification));

    [Required]
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int NotificationStatisticsId { get; private set; }

    public int NotificationId { get; private set; }

    [ForeignKey(nameof(NotificationId))] public Notification Notification { get; private set; }

    public int RecipientsTotal { get; set; }

    public int SentTotal { get; set; }

    public int ErrorsTotal { get; set; }
}
