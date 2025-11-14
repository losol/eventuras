using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Services.Certificates;
using Losol.Communication.Email;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.BackgroundJobs;

/// <summary>
/// Background service that processes certificate delivery jobs from the queue.
/// </summary>
public sealed class CertificateBackgroundWorker : BackgroundService
{
    private readonly IBackgroundJobQueue _jobQueue;
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly ILogger<CertificateBackgroundWorker> _logger;

    public CertificateBackgroundWorker(
        IBackgroundJobQueue jobQueue,
        IServiceScopeFactory serviceScopeFactory,
        ILogger<CertificateBackgroundWorker> logger)
    {
        _jobQueue = jobQueue ?? throw new ArgumentNullException(nameof(jobQueue));
        _serviceScopeFactory = serviceScopeFactory ?? throw new ArgumentNullException(nameof(serviceScopeFactory));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Certificate Background Worker is starting");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var (certificateId, accessControlDone) = await _jobQueue.DequeueCertificateJobAsync(stoppingToken);

                _logger.LogInformation("Processing certificate delivery for certificate {CertificateId}", certificateId);

                // Create a new scope for each job to get scoped services
                await using var scope = _serviceScopeFactory.CreateAsyncScope();

                await ProcessCertificateAsync(
                    certificateId,
                    accessControlDone,
                    scope.ServiceProvider,
                    stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Expected when cancellation is requested
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing certificate job");
                // Continue processing other jobs even if one fails
            }
        }

        _logger.LogInformation("Certificate Background Worker is stopping");
    }

    private async Task ProcessCertificateAsync(
        int certificateId,
        bool accessControlDone,
        IServiceProvider serviceProvider,
        CancellationToken cancellationToken)
    {
        var certificateRetrievalService = serviceProvider.GetRequiredService<ICertificateRetrievalService>();
        var certificateRenderer = serviceProvider.GetRequiredService<ICertificateRenderer>();
        var emailSender = serviceProvider.GetRequiredService<IEmailSender>();

        var certificate = await certificateRetrievalService.GetCertificateByIdAsync(
            certificateId,
            accessControlDone: accessControlDone,
            cancellationToken: cancellationToken);

        if (certificate == null)
        {
            _logger.LogError("Certificate {CertificateId} not found, not sending", certificateId);
            return;
        }

        var pdfStream = await certificateRenderer
            .RenderToPdfAsStreamAsync(new CertificateViewModel(certificate));

        if (pdfStream == null)
        {
            _logger.LogError("Certificate {CertificateId} could not be rendered, not sending", certificateId);
            return;
        }

        var memoryStream = new MemoryStream();
        await pdfStream.CopyToAsync(memoryStream, cancellationToken);

        if (memoryStream.Length == 0)
        {
            _logger.LogError("Certificate {CertificateId} was empty, not sending", certificateId);
            return;
        }

        memoryStream.Position = 0;

        var emailModel = new EmailModel
        {
            Recipients = new[] { new Address { Email = certificate.RecipientEmail } },
            Subject = $"Kursbevis for {certificate.Title}",
            TextBody = "Her er kursbeviset! Gratulere!",
            Attachments = new List<Attachment>
            {
                new()
                {
                    Filename = "kursbevis.pdf",
                    ContentType = "application/pdf",
                    Bytes = memoryStream.ToArray()
                }
            }
        };

        _logger.LogInformation("Sending certificate {CertificateId} to user {UserId}",
            certificateId, certificate.RecipientUserId);

        await emailSender.SendEmailAsync(emailModel,
            new EmailOptions { OrganizationId = certificate.IssuingOrganizationId });

        _logger.LogInformation("Successfully sent certificate {CertificateId}", certificateId);
    }
}
