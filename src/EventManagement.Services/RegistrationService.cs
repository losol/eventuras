using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using losol.EventManagement.Services.Extensions;
using losol.EventManagement.Services.TalentLms;
using Microsoft.EntityFrameworkCore;

namespace losol.EventManagement.Services {
	public class RegistrationService : IRegistrationService {
		private readonly ApplicationDbContext _db;
		private readonly IPaymentMethodService _paymentMethods;
        private readonly ITalentLmsService _talentLms;

        public RegistrationService (
				ApplicationDbContext db, 
				IPaymentMethodService paymentMethods,
				ITalentLmsService talentLms) {
			_db = db;
			_paymentMethods = paymentMethods;
            _talentLms = talentLms;
        }

		public async Task<Registration> GetAsync (int id) {
			return await _db.Registrations
				.FindAsync (id);
		}

		public Task<Registration> GetAsync (string userId, int eventId) {
			return _db.Registrations.Where (a => a.UserId == userId && a.EventInfoId == eventId)
				.SingleOrDefaultAsync ();
		}

		public Task<Registration> GetWithOrdersAsync (int id) {
			return _db.Registrations.Where (r => r.RegistrationId == id)
				.Include (r => r.Orders)
				.ThenInclude (o => o.OrderLines)
				.SingleOrDefaultAsync ();
		}

		public async Task<Registration> GetWithEventInfoAsync (int id) {
			return await _db.Registrations
				.Where (x => x.RegistrationId == id)
				.Include (r => r.EventInfo)
				.SingleOrDefaultAsync ();
		}

		public async Task<Registration> GetWithEventInfoAndOrders (int id) =>
			await _db.Registrations
			.Include (r => r.Orders)
			.ThenInclude (o => o.OrderLines)
			.Include (r => r.User)
			.Include(r => r.EventInfo)
			.SingleOrDefaultAsync(o => o.RegistrationId == id);

		public async Task<List<Registration>> GetRegistrations (int eventId) {
			return await _db.Registrations
				.Where (r => r.EventInfoId == eventId)
				.Include (r => r.EventInfo)
				.Include (r => r.User)
				.ToListAsync ();
		}

		public async Task<List<Registration>> GetRegistrationsWithOrders (int eventId) =>
			await _db.Registrations
			.Where (r => r.EventInfoId == eventId)
			.Include (r => r.Orders)
			.ThenInclude (o => o.OrderLines)
			.Include (r => r.User)
			.ToListAsync ();

		public async Task<int> CreateRegistration (Registration registration, int[] productIds, int[] variantIds) {
			// Check if registration exists
			var existingRegistration = await GetAsync (registration.UserId, registration.EventInfoId);
			if (existingRegistration != null) {
				throw new InvalidOperationException ("The user can only register once!");
			}

			// Create orders if productIds is not null
			if (productIds != null) {
				var products = await _db.Products
					.Where (p => productIds.Contains (p.ProductId))
					.Include (p => p.ProductVariants)
					.AsNoTracking ()
					.ToListAsync ();

				// Create an order for the registration
				registration.CreateOrder (
					products,
					products.SelectMany (p => p.ProductVariants)
					.Where (v => variantIds?.Contains (v.ProductVariantId) ?? false)
				);
			}

			// Create the registration
			await _db.Registrations.AddAsync (registration);
			return await _db.SaveChangesAsync ();
		}

		public Task<int> CreateRegistration (Registration registration) =>
			CreateRegistration (registration, null, null);

		public async Task<int> SetRegistrationAsVerified (int id) {
			var registration = await _db.Registrations
									.Include(r => r.User)
									.Include(r => r.EventInfo)
									.SingleOrDefaultAsync(r => r.RegistrationId == id);
			registration.Verify ();

			if(registration.EventInfo.OnDemand)
			{
				var user = await _talentLms.CreateUserIfNotExists(new TalentLms.Models.User {
					FirstName = registration.ParticipantName,
					Email = registration.User.Email,
					Login = registration.User.Email,
					Password =  PasswordHelper.GeneratePassword(length: 6)
				});
				var matches = Regex.Match(registration.EventInfo.RegistrationsUrl, @"course_id:(\d*)");
				int courseId = int.Parse(matches.Groups[0].Value);
				await _talentLms.EnrolUserToCourse(userId: user.Id.Value, courseId: courseId);
			}
			
			return await _db.SaveChangesAsync ();
		}

		public async Task<int> SetRegistrationAsAttended (int id) {
			var registration = await GetAsync (id);
			registration.MarkAsAttended ();
			return await _db.SaveChangesAsync ();
		}

		public async Task<int> SetRegistrationAsNotAttended (int id) {
			var registration = await GetAsync (id);
			registration.MarkAsNotAttended ();
			return await _db.SaveChangesAsync ();
		}

		public async Task<bool> AddProductToRegistration (string email, int eventId, int productId, int? variantId) {
			var userId = await _db.Users.Where (u => u.Email == email)
				.Select (u => u.Id)
				.SingleOrDefaultAsync ();
			_ = userId ??
				throw new ArgumentException (message: "Invalid email.", paramName : nameof (email));

			var registration = await _db.Registrations
				.Where (a => a.UserId == userId && a.EventInfoId == eventId)
				.Include (r => r.Orders)
				.ThenInclude (o => o.OrderLines)
				.SingleOrDefaultAsync ();
			_ = registration ??
				throw new ArgumentException (message: "Invalid eventId or the user is not registered for the event", paramName : nameof (eventId));

			return await _createOrUpdateOrderAsync (registration, new int[] { productId }, new int[] { variantId.Value });
		}

		public async Task<bool> CreateOrUpdateOrder (int registrationId, int[] products, int[] variants) {
			var registration = await _db.Registrations
				.Where (a => a.RegistrationId == registrationId)
				.Include (r => r.Orders)
				.ThenInclude (o => o.OrderLines)
				.SingleOrDefaultAsync ();
			_ = registration ??
				throw new ArgumentException (message: "Invalid registration id.", paramName : nameof (registrationId));

			return await _createOrUpdateOrderAsync (registration, products, variants);
		}

		public Task<bool> CreateOrUpdateOrder (int registrationId, int productId, int? productVariantId) {
			var productIds = new int[] { productId };
			int[] variantIds = null;
			if (productVariantId.HasValue) {
				variantIds = new int[] { productVariantId.Value };
			}
			return CreateOrUpdateOrder (registrationId, productIds, variantIds);
		}

		private async Task<bool> _createOrUpdateOrderAsync (Registration registration, int[] productIds, int[] variantIds) {
			// Get lists with a single product & variant in them
			var products = await _db.Products
				.Where (p => productIds.Contains (p.ProductId))
				.Include (p => p.ProductVariants)
				.AsNoTracking ()
				.ToListAsync ();
			if (products?.Count != productIds.Count ()) {
				throw new ArgumentException (message: "Couldnt find all the products. Check the ids.", paramName : nameof (productIds));
			}
			var variants = products.First ().ProductVariants.Where (v => variantIds.Contains (v.ProductVariantId));

			// Create/update an order as needed.
			registration.CreateOrUpdateOrder (products, variants);

			// Set paymentmethod to default method if null.
			if (registration.PaymentMethodId == null) {
				registration.PaymentMethodId = _paymentMethods.GetDefaultPaymentMethodId();
			}

			// Persist the changes
			return await _db.SaveChangesAsync () > 0;
		}

		public async Task<bool> UpdateParticipantInfo(int registrationId, string name, string jobTitle, string city, string Employer) {
			var reg = await _db.Registrations
				.Where( m => m.RegistrationId == registrationId)
				.FirstOrDefaultAsync();
			
			reg.ParticipantName = name;
			reg.ParticipantJobTitle =  jobTitle;
			reg.ParticipantCity = city;
			reg.ParticipantEmployer = Employer;
			_db.Update(reg);
			return await _db.SaveChangesAsync() > 0;
		}

		public async Task<bool> UpdateRegistrationStatus(int registrationId, Registration.RegistrationStatus status) {
			var reg = await _db.Registrations
				.Where( m => m.RegistrationId == registrationId)
				.FirstOrDefaultAsync();
			
			reg.Status = status;
			_db.Update(reg);
			return await _db.SaveChangesAsync() > 0;
		}


		public async Task<bool> UpdateRegistrationType(int registrationId, Registration.RegistrationType type) {
			var reg = await _db.Registrations
				.Where( m => m.RegistrationId == registrationId)
				.FirstOrDefaultAsync();
			
			reg.Type = type;
			_db.Update(reg);
			return await _db.SaveChangesAsync() > 0;
		}


		/* 
		private async Task<bool> ConfirmRegistrationEmail(Registration registration)
		{
			// Prepare an email to send out
			var emailVM = new EmailMessage()
			{
				Name = Registration.ParticipantName,
				Email = Registration.Email,
				Subject = "Du var allerede påmeldt!",
				Message = @"Vi hadde allerede registrert deg i systemet.
								Ta kontakt med ole@nordland-legeforening hvis du tror det er skjedd noe feil her!
								"
			};

			// If registered but not verified, just send reminder of verification. 
			if (registration.Verified == false)
			{
				var verificationUrl = Url.Action("Confirm", "Register", new { id = registration.RegistrationId, auth = registration.VerificationCode }, protocol: Request.Scheme);
				emailVM.Subject = "En liten bekreftelse bare...";
				emailVM.Message = $@"Vi hadde allerede registrert deg i systemet, men du har ikke bekreftet enda.
								<p><a href='{verificationUrl}'>Bekreft her</a></p>
								<p></p>
								<p>Hvis lenken ikke virker, så kan du kopiere inn teksten under i nettleseren:
								{verificationUrl} </p>";
			}

			await _standardEmailSender.SendAsync(emailVM);
			return RedirectToPage("/Info/EmailSent");
		}
		 */
	}
}