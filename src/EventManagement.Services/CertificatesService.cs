using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace losol.EventManagement.Services {

	public class CertificatesService : ICertificatesService {

		private readonly ApplicationDbContext _db;
		private readonly IPaymentMethodService _paymentMethods;

		public CertificatesService (ApplicationDbContext db, IPaymentMethodService paymentMethods) {
			_db = db;
			_paymentMethods = paymentMethods;
		}

		public async Task<Certificate> GetAsync (int certificateId) {
			var certificate = await _db.Certificates
				.Include (c => c.Evidence)
					.ThenInclude (c => c.EventInfo)
				.Include (c => c.RecipientUser)
				.SingleOrDefaultAsync (c => c.CertificateId == certificateId);

			return certificate;
		}

		public async Task<Certificate> GetForRegistrationAsync (int registrationId) {
			var certificate = await _db.Certificates
				.Where( c => c.Evidence.Any(d => d.RegistrationId == registrationId) ) 
				.Include (c => c.Evidence)
					.ThenInclude (c => c.EventInfo)
				.Include (c => c.RecipientUser)
				.SingleOrDefaultAsync ();

			return certificate;
		}


		public Task<List<Registration>> GetRegistrationsAsync(int productId)
		{
			return _db.Registrations
				.Where(r => r.Orders.Any(o => o.OrderLines.Any(l => l.ProductId == productId)))
				.Include(r => r.User)
				.Include(r => r.Orders)
					.ThenInclude(o => o.OrderLines)
				.AsNoTracking()
				.ToListAsync();
		}

		public async Task CreateCertificate (int registrationId) {

			var registration = await _db.Registrations
				.Include(e => e.EventInfo)
				.Include(e => e.User)
				.Where(e => e.RegistrationId == registrationId)
				.SingleOrDefaultAsync();

			var certificate = new Certificate {
				Title = registration.EventInfo.Title,
				Description = registration.EventInfo.DateStart.ToString(),
				RecipientName = registration.ParticipantName,
				RecipientEmail = registration.User.Email,
				RecipientUserId = registration.User.Id,



			};

			certificate.Evidence.Add(registration);
			

		}





		public async Task<List<Certificate>> CreateNewCertificates (int eventId, string issuedByUsername) {

			_ = issuedByUsername ??
				throw new ArgumentNullException (paramName: nameof (issuedByUsername));

			var infoQueryable = _db.EventInfos
				.Where (e => e.EventInfoId == eventId);
			var eventInfo = await infoQueryable.AsNoTracking ().SingleOrDefaultAsync ();
			_ = eventInfo ??
				throw new ArgumentException ("Not event corresponds to that eventId", paramName : nameof (eventId));

			var user = await _db.ApplicationUsers
				.Where (u => issuedByUsername == u.UserName)
				.SingleOrDefaultAsync ();
			_ = user ??
				throw new ArgumentException ("Invalid userId", paramName : nameof (issuedByUsername));

			/*var certs = await infoQueryable.SelectMany (i => i.Registrations)
				.Where (r => r.Attended && r.Certificate == null)
				.Select (r => new Certificate {
					CertificateId = r.RegistrationId,
						Recipient.Name = r.ParticipantName,
						Recipient.UserId = r.UserId,

						Title = eventInfo.Title,
						Description = eventInfo.CertificateDescription,

						EventInfoId = eventInfo.EventInfoId,

						Issuer = new Certificate.CertificateIssuer {
							OrganizationId = 0,
								OrganizationName = "Nordland legeforening", // TODO should not be hardcoded
								OrganizationLogoUrl = "/assets/images/logos/logo-nordland_legeforening-small-transparent.png",
								IssuedByUserId = user.Id,
								IssuedByName = "Anette Holand-Nilsen",
								IssuedInCity = eventInfo.City
						}
				}).ToListAsync ();
			_db.Certificates.AddRange (certs);
			*/
			await _db.SaveChangesAsync ();

			//var newIds = certs.Select (c => c.CertificateId);
			return await _db.Certificates
				//.Where (c => newIds.Contains (c.CertificateId))
				//.Include (c => c.RecipientUser)
				//.Include (c => c.EventInfo)
				.ToListAsync ();
		}

	}
}