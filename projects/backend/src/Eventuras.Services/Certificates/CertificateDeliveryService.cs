using Eventuras.Domain;
using Eventuras.Services.Email;
using Losol.Communication.Email;
using System;
using System.IO;
using System.Net.Mime;
using System.Threading;
using System.Threading.Tasks;

namespace Eventuras.Services.Certificates
{
    internal class CertificateDeliveryService : ICertificateDeliveryService
    {
        private readonly ICertificateRenderer _certificateRenderer;
        private readonly IApplicationEmailSender _emailSender;

        public CertificateDeliveryService(
            ICertificateRenderer certificateRenderer,
            IApplicationEmailSender emailSender)
        {
            _certificateRenderer = certificateRenderer ?? throw
                new ArgumentNullException(nameof(certificateRenderer));

            _emailSender = emailSender ?? throw
                new ArgumentNullException(nameof(emailSender));
        }

        public async Task SendCertificateAsync(Certificate certificate, CancellationToken cancellationToken = default)
        {
            var pdfStream = await _certificateRenderer
                .RenderToPdfAsStreamAsync(new CertificateViewModel(certificate));

            var memoryStream = new MemoryStream();
            await pdfStream.CopyToAsync(memoryStream, cancellationToken);
            await _emailSender.SendStandardEmailAsync(certificate.RecipientEmail,
                $"Kursbevis for {certificate.Title}",
                "Her er kursbeviset! Gratulere!",
                new Attachment
                {
                    Filename = "kursbevis.pdf",
                    ContentType = MediaTypeNames.Application.Pdf,
                    Bytes = memoryStream.ToArray()
                });
        }
    }
}
