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

		public async Task<Certificate> AddCertificate (int registrationId) {

			var registration = await _db.Registrations
				.Include(e => e.EventInfo)
				.Include(e => e.User)
				.Where(e => e.RegistrationId == registrationId)
				.SingleOrDefaultAsync();
			

			Console.WriteLine("**** ADD REG");
			Console.WriteLine(registration.RegistrationId);

			var certificate = new Certificate {
				Title = registration.EventInfo.Title,
				Description = registration.EventInfo.CertificateDescription,
				RecipientName = registration.ParticipantName,
				RecipientEmail = registration.User.Email,
				RecipientUserId = registration.User.Id,

				IssuedByName = "Anette Holand-Nilsen"
				
			};

			certificate.Evidence.Add(registration);

			// Save the new certificate
			_db.Certificates.Add(certificate);
			Console.WriteLine(await _db.SaveChangesAsync());

			Console.WriteLine("**** SAVED CERT");
			Console.WriteLine(registration.RegistrationId);

			// Update the registration
			registration.CertificateId = certificate.CertificateId;
			_db.Registrations.Update(registration);
			await _db.SaveChangesAsync();

			return certificate;
		}


		public async Task<List<Certificate>> CreateCertificatesForEvent (int eventInfoId) {
			var eventInfo = await _db.EventInfos
				.Include(m => m.Registrations)
				.Where(m => m.EventInfoId == eventInfoId)
				.SingleOrDefaultAsync();
			
			if (eventInfo == null) {
				throw new ArgumentException("No event found") ;
			}

			var result = new List<Certificate>();
			var newRegistrations = eventInfo.Registrations
				.Where (m => m.Attended == true && m.HasCertificate == false)
				.ToList();
			
			if (newRegistrations != null) {
				foreach (var registration in newRegistrations ) {
					Console.WriteLine("****");
					Console.WriteLine(registration.RegistrationId);
					
					result.Add( await AddCertificate( registration.RegistrationId ) ) ; 
				}
			}

			return result;
		}
	}
}