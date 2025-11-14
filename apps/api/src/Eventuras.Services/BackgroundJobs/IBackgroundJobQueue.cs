using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.BackgroundJobs;

/// <summary>
/// Represents a queue for background jobs that need to be processed asynchronously.
/// </summary>
public interface IBackgroundJobQueue
{
    /// <summary>
    /// Queues a notification job to be processed in the background.
    /// </summary>
    /// <param name="recipientId">The ID of the notification recipient</param>
    /// <param name="accessControlDone">Whether access control has already been performed</param>
    /// <param name="cancellationToken">Cancellation token</param>
    ValueTask QueueNotificationJobAsync(int recipientId, bool accessControlDone = false, CancellationToken cancellationToken = default);

    /// <summary>
    /// Queues a certificate delivery job to be processed in the background.
    /// </summary>
    /// <param name="certificateId">The ID of the certificate to deliver</param>
    /// <param name="accessControlDone">Whether access control has already been performed</param>
    /// <param name="cancellationToken">Cancellation token</param>
    ValueTask QueueCertificateJobAsync(int certificateId, bool accessControlDone = false, CancellationToken cancellationToken = default);

    /// <summary>
    /// Dequeues a notification job from the queue.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>A tuple containing the recipient ID and access control flag</returns>
    ValueTask<(int RecipientId, bool AccessControlDone)> DequeueNotificationJobAsync(CancellationToken cancellationToken);

    /// <summary>
    /// Dequeues a certificate job from the queue.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>A tuple containing the certificate ID and access control flag</returns>
    ValueTask<(int CertificateId, bool AccessControlDone)> DequeueCertificateJobAsync(CancellationToken cancellationToken);
}
