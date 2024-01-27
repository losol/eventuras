using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Events;
using Eventuras.Services.Registrations;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using static Eventuras.Domain.Registration;

namespace Eventuras.Services.Certificates
{
    public class CertificateIssuingService : ICertificateIssuingService
    {
        private readonly IEventInfoAccessControlService _eventInfoAccessControlService;
        private readonly IRegistrationRetrievalService _registrationRetrievalService;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CertificateIssuingService> _logger;

        public CertificateIssuingService(
            IEventInfoAccessControlService eventInfoAccessControlService,
            IRegistrationRetrievalService registrationRetrievalService,
            ApplicationDbContext context,
            ILogger<CertificateIssuingService> logger)
        {
            _eventInfoAccessControlService = eventInfoAccessControlService ?? throw
                new ArgumentNullException(nameof(eventInfoAccessControlService));

            _registrationRetrievalService = registrationRetrievalService ?? throw
                new ArgumentNullException(nameof(registrationRetrievalService));

            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<ICollection<Certificate>> CreateCertificatesForEventAsync(EventInfo eventInfo,
            CancellationToken cancellationToken)
        {
            await _eventInfoAccessControlService
                .CheckEventManageAccessAsync(eventInfo, cancellationToken);

            var certificates = new List<Certificate>();

            for (var reader = ReadRegistrations(eventInfo, havingNoCertificateOnly: true);
                await reader.HasMoreAsync(cancellationToken);)
            {
                certificates.AddRange(from registration in await reader.ReadNextAsync(cancellationToken)
                                      select registration.CreateCertificate());

                await _context.SaveChangesAsync(cancellationToken);
            }

            return certificates;
        }

        public async Task<ICollection<Certificate>> UpdateCertificatesForEventAsync(EventInfo eventInfo,
            CancellationToken cancellationToken)
        {
            _logger.LogInformation("Updating certificates for event #{EventId}", eventInfo.EventInfoId);

            await _eventInfoAccessControlService
                .CheckEventManageAccessAsync(eventInfo, cancellationToken);

            var certificates = new List<Certificate>();

            for (var reader = ReadRegistrations(eventInfo, havingCertificateOnly: true);
                await reader.HasMoreAsync(cancellationToken);)
            {
                certificates.AddRange(from registration in await reader.ReadNextAsync(cancellationToken)
                                      select registration.UpdateCertificate());

                await _context.SaveChangesAsync(cancellationToken);
            }

            return certificates;
        }

        private PageReader<Registration> ReadRegistrations(
            EventInfo eventInfo,
            bool havingCertificateOnly = false,
            bool havingNoCertificateOnly = false)
        {
            return new PageReader<Registration>(async (offset, limit, token) =>
                await _registrationRetrievalService.ListRegistrationsAsync(
                    new RegistrationListRequest
                    {
                        Offset = offset,
                        Limit = limit,
                        Filter = new RegistrationFilter
                        {
                            EventInfoId = eventInfo.EventInfoId,
                            HavingStatuses = new[] { RegistrationStatus.Finished },
                            HavingCertificateOnly = havingCertificateOnly,
                            HavingNoCertificateOnly = havingNoCertificateOnly
                        }
                    },
                    RegistrationRetrievalOptions.ForCertificateIssuing, token));
        }
    }
}
