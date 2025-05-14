using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Losol.Communication.Email;
using Microsoft.Extensions.Logging;
using static Eventuras.Domain.Certificate;

namespace Eventuras.Services.Certificates;

internal class CertificateDeliveryService : ICertificateDeliveryService
{
    private readonly ICertificateRetrievalService _certificateRetrievalService;
    private readonly ICertificateManagementService _certificateManagementService;
    private readonly ICertificateRenderer _certificateRenderer;
    private readonly IEmailSender _emailSender;
    private readonly ILogger<CertificateDeliveryService> _logger;

    public CertificateDeliveryService(
        ICertificateRetrievalService certificateRetrievalService,
        ICertificateManagementService certificateManagementService,
        ICertificateRenderer certificateRenderer,
        IEmailSender emailSender,
        ILogger<CertificateDeliveryService> logger)
    {
        _certificateRetrievalService = certificateRetrievalService ?? throw
            new ArgumentNullException(nameof(certificateRetrievalService));

        _certificateManagementService = certificateManagementService ?? throw
            new ArgumentNullException(nameof(certificateManagementService));

        _certificateRenderer = certificateRenderer ?? throw
            new ArgumentNullException(nameof(certificateRenderer));

        _emailSender = emailSender ?? throw
            new ArgumentNullException(nameof(emailSender));

        _logger = logger ?? throw
            new ArgumentNullException(nameof(logger));
    }

    public async Task QueueCertificateForDeliveryAsync(int certificateId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Queueing certificate {Id} for delivery.",
            certificateId);

        var certificate = await _certificateRetrievalService.GetCertificateByIdAsync(certificateId,
            accessControlDone: true,
            cancellationToken: cancellationToken);

        if (certificate == null)
        {
            _logger.LogError("Certificate {Id} not found, not sending.", certificateId);
            return;
        }

        certificate.DeliveryStatus = CertificateDeliveryStatus.Queued;

        await _certificateManagementService.UpdateCertificateAsync(certificate);
    }

    public async Task SendCertificateAsync(int certificateId, bool accessControlDone,
        CancellationToken cancellationToken)
    {
        var certificate =
            await _certificateRetrievalService.GetCertificateByIdAsync(certificateId,
                accessControlDone: accessControlDone,
                cancellationToken: cancellationToken);

        if (certificate == null)
        {
            _logger.LogError("Certificate {Id} not found, not sending.",
                certificateId);
            return;
        }

        var pdfStream = await _certificateRenderer
            .RenderToPdfAsStreamAsync(new CertificateViewModel(certificate));

        if (pdfStream == null)
        {
            _logger.LogError("Certificate {Id} could not be rendered, not sending.",
                certificateId);
            return;
        }

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

        _logger.LogInformation("Sending certificate {Id} to user {UserId}.",
            certificateId, certificate.RecipientUserId);

        await _emailSender.SendEmailAsync(emailModel,
            new EmailOptions { OrganizationId = certificate.IssuingOrganizationId });
    }
}
