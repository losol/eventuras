using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;

namespace Eventuras.Services.BackgroundJobs;

/// <summary>
/// Thread-safe implementation of background job queue using Channel&lt;T&gt;.
/// </summary>
public sealed class BackgroundJobQueue : IBackgroundJobQueue
{
    private readonly Channel<(int RecipientId, bool AccessControlDone)> _notificationQueue;
    private readonly Channel<(int CertificateId, bool AccessControlDone)> _certificateQueue;

    public BackgroundJobQueue()
    {
        // Create bounded channels to prevent unbounded memory growth
        // If queue is full, WriteAsync will wait for space to become available
        var options = new BoundedChannelOptions(1000)
        {
            SingleWriter = false, // Multiple services can enqueue
            SingleReader = false, // Could have multiple workers in future
            FullMode = BoundedChannelFullMode.Wait // Wait for space when queue is full
        };

        _notificationQueue = Channel.CreateBounded<(int, bool)>(options);
        _certificateQueue = Channel.CreateBounded<(int, bool)>(options);
    }

    public async ValueTask QueueNotificationJobAsync(
        int recipientId,
        bool accessControlDone = false,
        CancellationToken cancellationToken = default)
    {
        await _notificationQueue.Writer.WriteAsync((recipientId, accessControlDone), cancellationToken);
    }

    public async ValueTask QueueCertificateJobAsync(
        int certificateId,
        bool accessControlDone = false,
        CancellationToken cancellationToken = default)
    {
        await _certificateQueue.Writer.WriteAsync((certificateId, accessControlDone), cancellationToken);
    }

    public async ValueTask<(int RecipientId, bool AccessControlDone)> DequeueNotificationJobAsync(
        CancellationToken cancellationToken)
    {
        return await _notificationQueue.Reader.ReadAsync(cancellationToken);
    }

    public async ValueTask<(int CertificateId, bool AccessControlDone)> DequeueCertificateJobAsync(
        CancellationToken cancellationToken)
    {
        return await _certificateQueue.Reader.ReadAsync(cancellationToken);
    }
}
