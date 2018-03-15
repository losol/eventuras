using System;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace losol.EventManagement.Services
{
	public class RegistrationService : IRegistrationService
	{
		private readonly ApplicationDbContext _db;


		public RegistrationService(ApplicationDbContext db)
		{
			_db = db;
		}

		public async Task<Registration> GetAsync(int id)
		{
			return await _db.Registrations
				            .FindAsync(id);
		}

		public Task<Registration> GetAsync(string userId, int eventId)
		{
			return _db.Registrations.Where(a => a.UserId == userId && a.EventInfoId == eventId)
				      .SingleOrDefaultAsync();
		}

		public async Task<Registration> GetWithEventInfoAsync(int id)
		{
			return await _db.Registrations
				            .Where(x => x.RegistrationId == id)
							.Include(r => r.EventInfo)
			       		    .SingleOrDefaultAsync();
		}

		public async Task<int> CreateRegistration(Registration registration)
		{
			// Check if registration exists
			var existingRegistration = await GetAsync(registration.UserId, registration.EventInfoId);
			if(existingRegistration != null)
			{
				throw new InvalidOperationException("The user can only register once!");
			}

			// Create the registration
			await _db.Registrations.AddAsync(registration);
			return await _db.SaveChangesAsync();
		}

		public async Task<int> CreateRegistrationWithOrder(Registration registration, int[] productIds, int[] variantIds)
		{
			// Check if registration exists
			var existingRegistration = await GetAsync(registration.UserId, registration.EventInfoId);
			if(existingRegistration != null)
			{
				throw new InvalidOperationException("The user can only register once!");
			}

			var products = await _db.Products
									.Where(p => productIds.Contains(p.ProductId))
									.Include(p => p.ProductVariants)
									.AsNoTracking()
									.ToListAsync();

			// Create an order for the registration
			registration.CreateOrder(
				products,
				products.SelectMany(p => p.ProductVariants)
						.Where(v => variantIds?.Contains(v.ProductVariantId) ?? false)
			);

			// Create the registration
			await _db.Registrations.AddAsync(registration);
			return await _db.SaveChangesAsync();
		}

		public Task<int> CreateRegistrationWithOrder(Registration registration, int[] productIds) =>
			CreateRegistrationWithOrder(registration, productIds, null);

		public async Task<int> SetRegistrationAsVerified(int id)
		{
			var registration = await GetAsync(id);
			registration.Verify();
			return await _db.SaveChangesAsync();
		}

	}
}
