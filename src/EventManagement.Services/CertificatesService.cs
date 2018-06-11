using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using static losol.EventManagement.Domain.Registration;

namespace losol.EventManagement.Services {

	public class CertificatesService : ICertificatesService {

		private readonly ApplicationDbContext _db;
		private readonly IPaymentMethodService _paymentMethods;
		private readonly ILogger _logger;

		public CertificatesService (ApplicationDbContext db, IPaymentMethodService paymentMethods, ILogger<CertificatesService> logger) {
			_db = db;
			_paymentMethods = paymentMethods;
			_logger = logger;
		}

		public async Task<Certificate> GetAsync (int certificateId) {
			var certificate = await _db.Certificates
				.Include (c => c.Evidence)
				.ThenInclude (c => c.Registration)
				.ThenInclude (c => c.EventInfo)
				.Include (c => c.RecipientUser)
				.Include (c => c.IssuingOrganization)
				.Include (c => c.IssuingUser)
				.AsNoTracking ()
				.SingleOrDefaultAsync (c => c.CertificateId == certificateId);

			return certificate;
		}

		public async Task<Certificate> GetForRegistrationAsync (int registrationId) {
			var registration = await _db.Registrations
				.Where( m => m.RegistrationId == registrationId )
				.FirstOrDefaultAsync();

			if (registration.CertificateId != null) {
				return await GetAsync((int)registration.CertificateId);
			} else {
				return null;
			}
		}

		public async Task<Certificate> AddCertificate (int registrationId) {

			var registration = await _db.Registrations
				.Include (e => e.EventInfo)
				.ThenInclude (p => p.Organization)
				.Include (e => e.EventInfo)
				.ThenInclude (p => p.OrganizerUser)
				.Include (e => e.User)
				.Include (e => e.Certificate)
				.Where (e => e.RegistrationId == registrationId)
				.SingleOrDefaultAsync ();

			if (registration == null) {
				throw new ArgumentNullException ("Could not find registration.");
			}

			var certificate = new Certificate {
				Title = registration.EventInfo.Title,
				Description = registration.EventInfo.CertificateDescription,
				Comment = registration.CertificateComment,

				RecipientName = registration.ParticipantName,
				RecipientEmail = registration.User.Email,
				RecipientUserId = registration.User.Id,
			};

			// Add evidence description
			certificate.EvidenceDescription = $"{registration.EventInfo.Title} {registration.EventInfo.City}";
            if (registration.EventInfo.DateStart.HasValue) 
                { certificate.EvidenceDescription += " – " + registration.EventInfo.DateStart.Value.ToString("d");};
            if (registration.EventInfo.DateEnd.HasValue) 
                { certificate.EvidenceDescription += "-" + registration.EventInfo.DateEnd.Value.ToString("d");};

			// Add organization
			if (registration.EventInfo.OrganizationId != null) {
				certificate.IssuingOrganizationId = registration.EventInfo.OrganizationId;
			} else {
				certificate.IssuingOrganizationName = "Nordland legeforening";
			}
			
			// Add organizer user
			if (registration.EventInfo.OrganizerUserId != null) {
				certificate.IssuedByName = registration.EventInfo.OrganizerUser.Name;
				certificate.IssuingUserId = registration.EventInfo.OrganizerUserId;
			} else {
				certificate.IssuedByName = "Tove Myrbakk";
			}


			// Save cetificate
			_db.Certificates.Add (certificate);
			await _db.SaveChangesAsync ();

			// Add and save evidence
			var evidence = new CertificateEvidence{
				CertificateId = certificate.CertificateId,
				RegistrationId = registration.RegistrationId
			};
			registration.Certificate = certificate;
			_db.CertificateEvidences.Add(evidence);
			var result = await _db.SaveChangesAsync ();

			_logger.LogInformation($"* Added certificate (id {certificate.CertificateId}. Result code: {result} ***");

			return certificate;
		}

		public async Task<List<Certificate>> CreateCertificatesForEvent (int eventInfoId) {
			var eventInfo = await _db.EventInfos
				.Include (m => m.Registrations)
				.Where (m => m.EventInfoId == eventInfoId)
				.SingleOrDefaultAsync ();

			if (eventInfo == null) {
				throw new ArgumentException ("No event found");
			}

			var result = new List<Certificate> ();
			var newRegistrations = eventInfo.Registrations
				.Where (m => m.Status == RegistrationStatus.Finished && m.CertificateId == null)
				.ToList ();

			// Add certificates
			if (newRegistrations != null) {
				foreach (var registration in newRegistrations) {
					_logger.LogInformation($"*** Trying to add certificate for registration: {registration.RegistrationId} ***");
					result.Add (await AddCertificate (registration.RegistrationId));
				}
			}

			return result;
		}
	}
}