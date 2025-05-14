using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Losol.Communication.Email;
using Microsoft.Extensions.Logging;
using Quartz;
using static Eventuras.Domain.Certificate;

namespace Eventuras.Services.Certificates;

[DisallowConcurrentExecution]
public class CertificatesDeliveryJob : IJob
{
    private readonly ILogger _logger;
    private readonly ICertificateRetrievalService _certificateRetrievalService;
    private readonly ICertificateDeliveryService _certificateDeliveryService;

    public CertificatesDeliveryJob(ILogger<CertificatesDeliveryJob> logger,
        ICertificateRetrievalService certificateRetrievalService,
        ICertificateDeliveryService certificateDeliveryService)
    {
        _logger = logger;
        _certificateRetrievalService = certificateRetrievalService;
        _certificateDeliveryService = certificateDeliveryService;
    }

    public async Task Execute(IJobExecutionContext context)
    {
        _logger.LogInformation("Executing Certiciates Sender Job");

        var statusesToExecute = new[] { CertificateDeliveryStatus.Queued, CertificateDeliveryStatus.Started };

        var options = new CertificateRetrievalOptions
        {
            ForUpdate = true,
            LoadRecipientUser = true,
        };

        var certificatesToSend = await _certificateRetrievalService
            .GetCertificatesByDeliveryStatusAsync(statusesToExecute, options, accessControlDone: true);

        if (certificatesToSend.Count == 0)
        {
            _logger.LogInformation("No certificates found for Queued or Started delivery status");
            return;
        }

        foreach (var certificate in certificatesToSend)
        {
            await _certificateDeliveryService.SendCertificateAsync(certificate, new CancellationToken());
        }
    }
}
