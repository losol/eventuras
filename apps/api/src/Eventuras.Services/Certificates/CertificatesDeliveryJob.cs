using System;
using System.IO;
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
    private readonly ICertificateManagementService _certificateManagementService;
    private readonly ICertificateRenderer _certificateRenderer;
    private readonly IEmailSender _emailSender;

    public CertificatesDeliveryJob(ILogger<CertificatesDeliveryJob> logger,
        ICertificateRetrievalService certificateRetrievalService,
        ICertificateManagementService certificateManagementService,
        ICertificateRenderer certificateRenderer,
        IEmailSender emailSender)
    {
        _logger = logger;
        _certificateRetrievalService = certificateRetrievalService;
        _certificateManagementService = certificateManagementService;
        _certificateRenderer = certificateRenderer;
        _emailSender = emailSender;
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
            await ProcessCertificateSend(certificate);
        }
    }

    private async Task ProcessCertificateSend(Certificate certificate)
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
            await pdfStream.CopyToAsync(memoryStream);
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
