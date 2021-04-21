using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using static Eventuras.Domain.Registration;

namespace Eventuras.Services
{

    public class CertificatesService : ICertificatesService
    {

        private readonly ApplicationDbContext _db;
        private readonly IPaymentMethodService _paymentMethods;
        private readonly ILogger _logger;

        public CertificatesService(ApplicationDbContext db, IPaymentMethodService paymentMethods, ILogger<CertificatesService> logger)
        {
            _db = db;
            _paymentMethods = paymentMethods;
            _logger = logger;
        }

        public async Task<Certificate> GetAsync(int certificateId)
        {
            var certificate = await _db.Certificates
                .Include(c => c.RecipientUser)
                .Include(c => c.IssuingOrganization)
                .Include(c => c.IssuingUser)
                .AsNoTracking()
                .SingleOrDefaultAsync(c => c.CertificateId == certificateId);

            return certificate;
        }

        public async Task<Certificate> GetForRegistrationAsync(int registrationId)
        {
            var registration = await _db.Registrations
                .Where(m => m.RegistrationId == registrationId)
                .FirstOrDefaultAsync();

            if (registration.CertificateId != null)
            {
                return await GetAsync((int)registration.CertificateId);
            }
            else
            {
                return null;
            }
        }

        public async Task<Certificate> AddCertificate(int registrationId, CultureInfo culture)
        {

            var registration = await _db.Registrations
                .Include(e => e.EventInfo)
                .ThenInclude(p => p.Organization)
                .Include(e => e.EventInfo)
                .ThenInclude(p => p.OrganizerUser)
                .Include(e => e.User)
                .Include(e => e.Certificate)
                .Where(e => e.RegistrationId == registrationId)
                .SingleOrDefaultAsync();

            if (registration == null)
            {
                throw new ArgumentNullException("Could not find registration.");
            }

            var certificate = new Certificate
            {
                Title = registration.EventInfo.Title,
                Description = registration.EventInfo.CertificateDescription,
                Comment = registration.CertificateComment,

                RecipientName = registration.User.Name,
                RecipientEmail = registration.User.Email,
                RecipientUserId = registration.User.Id,
            };

            // Add evidence description
            certificate.EvidenceDescription = $"{registration.EventInfo.Title} {registration.EventInfo.City}";
            if (registration.EventInfo.DateStart.HasValue)
            { certificate.EvidenceDescription += " – " + registration.EventInfo.DateStart.Value.ToString(culture); };
            if (registration.EventInfo.DateEnd.HasValue)
            { certificate.EvidenceDescription += "-" + registration.EventInfo.DateEnd.Value.ToString(culture); };

            // Add organization
            if (registration.EventInfo.OrganizationId != null)
            {
                certificate.IssuingOrganizationId = registration.EventInfo.OrganizationId;
            }
            else
            {
                certificate.IssuingOrganizationName = "Nordland legeforening";
            }

            // Add organizer user
            if (registration.EventInfo.OrganizerUserId != null)
            {
                certificate.IssuedByName = registration.EventInfo.OrganizerUser.Name;
                certificate.IssuingUserId = registration.EventInfo.OrganizerUserId;
            }
            else
            {
                certificate.IssuedByName = "Tove Myrbakk";
            }

            // Save cetificate
            _db.Certificates.Add(certificate);
            var result = await _db.SaveChangesAsync();

            registration.CertificateId = certificate.CertificateId;
            _db.Update(registration);
            await _db.SaveChangesAsync();

            _logger.LogInformation($"* Added certificate (id {certificate.CertificateId}. Result code: {result} ***");

            return certificate;
        }

        public async Task<List<Certificate>> CreateCertificatesForEvent(int eventInfoId, CultureInfo culture)
        {
            var eventInfo = await _db.EventInfos
                .Include(m => m.Registrations)
                .Where(m => m.EventInfoId == eventInfoId)
                .SingleOrDefaultAsync();

            if (eventInfo == null)
            {
                throw new ArgumentException("No event found");
            }

            var result = new List<Certificate>();
            var newRegistrations = eventInfo.Registrations
                .Where(m => m.Status == RegistrationStatus.Finished && m.CertificateId == null)
                .ToList();

            // Add certificates
            if (newRegistrations != null)
            {
                foreach (var registration in newRegistrations)
                {
                    _logger.LogInformation($"*** Trying to add certificate for registration: {registration.RegistrationId} ***");
                    result.Add(await AddCertificate(registration.RegistrationId, culture));
                }
            }

            return result;
        }

        public async Task<List<Certificate>> UpdateCertificatesForEvent(int eventInfoId, CultureInfo culture)
        {
            var eventInfo = await _db.EventInfos
                .Include(m => m.Registrations)
                .ThenInclude(mr => mr.User)
                .Include(m => m.OrganizerUser)
                .Where(m => m.EventInfoId == eventInfoId)
                .SingleOrDefaultAsync();

            if (eventInfo == null)
            {
                throw new ArgumentException("No event found");
            }
            _logger.LogInformation($"Updating certificates for {eventInfo.Title} (id: {eventInfoId})");

            var registrationsWithCertificates = eventInfo.Registrations.Where(m => m.CertificateId != null);
            var result = new List<Certificate>();

            foreach (var registration in registrationsWithCertificates)
            {
                _logger.LogInformation($"* Updating certificate id {registration.CertificateId}");

                var certificate = await _db.Certificates
                    .Where(m => m.CertificateId == registration.CertificateId)
                    .SingleOrDefaultAsync();

                certificate.Title = registration.EventInfo.Title;
                certificate.Description = registration.EventInfo.CertificateDescription;
                certificate.Comment = registration.CertificateComment;
                certificate.RecipientName = registration.User.Name;
                certificate.RecipientEmail = registration.User.Email;
                certificate.RecipientUserId = registration.User.Id;

                // Add evidence description
                certificate.EvidenceDescription = $"{registration.EventInfo.Title} {registration.EventInfo.City}";
                if (registration.EventInfo.DateStart.HasValue)
                { certificate.EvidenceDescription += " – " + registration.EventInfo.DateStart.Value.ToString(culture); };
                if (registration.EventInfo.DateEnd.HasValue)
                { certificate.EvidenceDescription += "-" + registration.EventInfo.DateEnd.Value.ToString(culture); };

                // Add organization
                if (registration.EventInfo.OrganizationId != null)
                {
                    certificate.IssuingOrganizationId = registration.EventInfo.OrganizationId;
                }
                else
                {
                    certificate.IssuingOrganizationName = "Nordland legeforening";
                }

                // Add organizer user
                if (registration.EventInfo.OrganizerUserId != null)
                {
                    certificate.IssuedByName = registration.EventInfo.OrganizerUser.Name;
                    certificate.IssuingUserId = registration.EventInfo.OrganizerUserId;
                }
                else
                {
                    certificate.IssuedByName = "Tove Myrbakk";
                }

                // Save changes
                _db.Certificates.Update(certificate);
                await _db.SaveChangesAsync();

                // Add the modified certificate to results.
                result.Add(certificate);

            }

            return result;
        }
    }
}
