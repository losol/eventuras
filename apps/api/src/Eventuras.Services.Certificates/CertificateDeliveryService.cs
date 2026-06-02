using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Services.BackgroundJobs;
using Losol.Communication.Email;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.Certificates;

internal class CertificateDeliveryService : ICertificateDeliveryService
{
    private readonly ICertificateRenderer _certificateRenderer;
    private readonly ICertificateRetrievalService _certificateRetrievalService;
    private readonly IEmailSender _emailSender;
    private readonly ILogger<CertificateDeliveryService> _logger;
    private readonly IBackgroundJobQueue _jobQueue;

    public CertificateDeliveryService(
        ICertificateRetrievalService certificateRetrievalService,
        ICertificateRenderer certificateRenderer,
        IEmailSender emailSender,
        ILogger<CertificateDeliveryService> logger,
        IBackgroundJobQueue jobQueue)
    {
        _certificateRetrievalService = certificateRetrievalService ?? throw
            new ArgumentNullException(nameof(certificateRetrievalService));

        _certificateRenderer = certificateRenderer ?? throw
            new ArgumentNullException(nameof(certificateRenderer));

        _emailSender = emailSender ?? throw
            new ArgumentNullException(nameof(emailSender));

        _logger = logger ?? throw
            new ArgumentNullException(nameof(logger));

        _jobQueue = jobQueue ?? throw
            new ArgumentNullException(nameof(jobQueue));
    }

    public async Task QueueCertificateForDeliveryAsync(int certificateId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Queueing certificate {Id} for delivery.",
            certificateId);

        await _jobQueue.QueueCertificateJobAsync(
            certificateId,
            accessControlDone: true,
            cancellationToken);
    }

}

