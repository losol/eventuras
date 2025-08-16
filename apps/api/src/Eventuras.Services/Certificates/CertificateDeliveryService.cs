using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
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

        await UpdateCertificateStatusAsync(certificate, CertificateDeliveryStatus.Queued);
    }

    public async Task SendCertificateAsync(Certificate certificate, CancellationToken cancellationToken) =>
        await SendCertificateInternalAsync(certificate, cancellationToken);

    public async Task SendCertificateAsync(int certificateId, bool accessControlDone, CancellationToken cancellationToken)
    {
        var certificate = await _certificateRetrievalService.GetCertificateByIdAsync(certificateId,
            accessControlDone: accessControlDone,
            cancellationToken: cancellationToken);

        if (certificate == null)
        {
            _logger.LogError("Certificate with ID {Id} not found.", certificateId);
            return;
        }

        await SendCertificateInternalAsync(certificate, cancellationToken);
    }

    private async Task SendCertificateInternalAsync(Certificate certificate, CancellationToken cancellationToken)
    {
        await UpdateCertificateStatusAsync(certificate, CertificateDeliveryStatus.Started);

        var pdfStream = await _certificateRenderer.RenderToPdfAsStreamAsync(new CertificateViewModel(certificate));
        if (pdfStream == null)
        {
            _logger.LogError("Certificate {Id} could not be rendered, not sending.", certificate.CertificateId);
            await UpdateCertificateStatusAsync(certificate, CertificateDeliveryStatus.Failed);
            return;
        }

        byte[] pdfBytes;

        using (pdfStream)
        using (var memoryStream = new MemoryStream())
        {
            await pdfStream.CopyToAsync(memoryStream, cancellationToken);
            if (memoryStream.Length == 0)
            {
                _logger.LogError("Certificate {Id} was empty, not sending.", certificate.CertificateId);
                await UpdateCertificateStatusAsync(certificate, CertificateDeliveryStatus.Failed);
                return;
            }
            pdfBytes = memoryStream.ToArray();
        }

        var emailModel = new EmailModel
        {
            Recipients = [new Address { Email = certificate.RecipientEmail }],
            Subject = $"Kursbevis for {certificate.Title}",
            TextBody = "Her er kursbeviset! Gratulere!",
            Attachments = [new()
            {
                Filename = "kursbevis.pdf",
                ContentType = "application/pdf",
                Bytes = pdfBytes
            }]
        };

        _logger.LogInformation("Sending certificate {Id} to user {UserId}.", certificate.CertificateId, certificate.RecipientUserId);

        try
        {
            await _emailSender.SendEmailAsync(emailModel, new EmailOptions { OrganizationId = certificate.IssuingOrganizationId });
            await UpdateCertificateStatusAsync(certificate, CertificateDeliveryStatus.Sent);
        }
        catch (Exception ex)
        {
            _logger.LogError("Failed to send certificate {Id} to user {UserId}. Exception message: {Exception}", certificate.CertificateId, certificate.RecipientUserId, ex.Message);
            await UpdateCertificateStatusAsync(certificate, CertificateDeliveryStatus.Failed);
        }
    }

    private async Task UpdateCertificateStatusAsync(Certificate certificate, CertificateDeliveryStatus status)
    {
        certificate.DeliveryStatus = status;
        await _certificateManagementService.UpdateCertificateAsync(certificate);
    }
}
