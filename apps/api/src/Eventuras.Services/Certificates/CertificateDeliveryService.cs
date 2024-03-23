using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Mime;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Email;
using Hangfire;
using Losol.Communication.Email;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.Certificates;

internal class CertificateDeliveryService : ICertificateDeliveryService
{
    private readonly ICertificateRetrievalService _certificateRetrievalService;
    private readonly ICertificateRenderer _certificateRenderer;
    private readonly IEmailSender _emailSender;
    private readonly ILogger<CertificateDeliveryService> _logger;

    public CertificateDeliveryService(
        ICertificateRetrievalService certificateRetrievalService,
        ICertificateRenderer certificateRenderer,
        IEmailSender emailSender,
        ILogger<CertificateDeliveryService> logger)
    {
        _certificateRetrievalService = certificateRetrievalService ?? throw
            new ArgumentNullException(nameof(certificateRetrievalService));

        _certificateRenderer = certificateRenderer ?? throw
            new ArgumentNullException(nameof(certificateRenderer));

        _emailSender = emailSender ?? throw
            new ArgumentNullException(nameof(emailSender));

        _logger = logger ?? throw
            new ArgumentNullException(nameof(logger));
    }

    public Task QueueCertificateForDeliveryAsync(int certificateId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Queueing certificate {Id} for delivery.",
            certificateId);

        BackgroundJob.Enqueue<CertificateDeliveryService>(
            "certificates_queue",
            x => x.SendCertificateAsync(certificateId, true, cancellationToken)
        );

        return Task.CompletedTask;
    }

    [AutomaticRetry(Attempts = 0)]
    public async Task SendCertificateAsync(int certificateId, bool accessControlDone,
        CancellationToken cancellationToken)
    {
        var certificate =
            await _certificateRetrievalService.GetCertificateByIdAsync(certificateId,
                accessControlDone: accessControlDone,
                cancellationToken: cancellationToken);

        var pdfStream = await _certificateRenderer
            .RenderToPdfAsStreamAsync(new CertificateViewModel(certificate));

        var memoryStream = new MemoryStream();
        await pdfStream.CopyToAsync(memoryStream, cancellationToken);

        if (memoryStream.Length == 0)
        {
            _logger.LogError("Certificate {Id} was empty, not sending.",
                certificateId);
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

        await _emailSender.SendEmailAsync(emailModel,
            new EmailOptions { OrganizationId = certificate.IssuingOrganizationId });
    }
}
