using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace losol.EventManagement.Services {

	public class CertificatesService : ICertificatesService {

		private readonly ApplicationDbContext _db;
		private readonly IPaymentMethodService _paymentMethods;
		// private readonly ILogger _logger;

		public CertificatesService (ApplicationDbContext db, IPaymentMethodService paymentMethods /*, ILogger logger */) {
			_db = db;
			_paymentMethods = paymentMethods;
			//_logger = logger;
		}

		public async Task<Certificate> GetAsync (int certificateId) {
			var certificate = await _db.Certificates
				.Include (c => c.Evidence)
				.ThenInclude (c => c.EventInfo)
				.Include (c => c.RecipientUser)
				.AsNoTracking ()
				.SingleOrDefaultAsync (c => c.CertificateId == certificateId);

			return certificate;
		}

		public async Task<Certificate> GetForRegistrationAsync (int registrationId) {
			var certificate = await _db.Certificates
				.Where (c => c.Evidence.Any (d => d.RegistrationId == registrationId))
				.Include (c => c.Evidence)
				.ThenInclude (c => c.EventInfo)
				.Include (c => c.RecipientUser)
				.AsNoTracking ()
				.SingleOrDefaultAsync ();

			return certificate;
		}

		public async Task<Certificate> AddCertificate (int registrationId) {

			var registration = await _db.Registrations
				.Include (e => e.EventInfo)
				.Include (e => e.User)
				.Where (e => e.RegistrationId == registrationId)
				.SingleOrDefaultAsync ();

			if (registration == null) {
				throw new ArgumentNullException ("Could not find registration.");
			}

			var certificate = new Certificate {
				Title = registration.EventInfo.Title,
					Description = registration.EventInfo.CertificateDescription,
					RecipientName = registration.ParticipantName,
					RecipientEmail = registration.User.Email,
					RecipientUserId = registration.User.Id,

					IssuedByName = "Anette Holand-Nilsen"

			};

			_db.Certificates.Add (certificate);
			var result = await _db.SaveChangesAsync ();

			// _logger.LogInformation($"* Added certificate (id {certificate.CertificateId}. Result code: {result} ***");

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
				.Where (m => m.Attended && m.CertificateId != null)
				.ToList ();

			// Add certificates
			if (newRegistrations != null) {
				foreach (var registration in newRegistrations) {
					// _logger.LogInformation($"*** Adding certificate for registration: {registration.RegistrationId} ***");
					result.Add (await AddCertificate (registration.RegistrationId));
				}
			}

			return result;
		}
	}
}