using System.Collections.Generic;
using System.Threading.Tasks;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Services
{
	public interface IRegistrationService
	{
		Task<Registration> GetAsync(int id);
		Task<Registration> GetAsync(string userId, int eventId);
		Task<Registration> GetWithEventInfoAsync(int id);
		Task<List<Registration>> GetRegistrations(int eventId);
		Task<List<Registration>> GetRegistrationsWithOrders(int eventId);
		Task<Certificate> GetCertificateAsync(int id);

		/// <summary>
		/// Creates new certificates for registrants with no existing certificates
		/// and returns the newly created certificates.
		/// </summary>
		/// <param name="eventId">The eventId to create certificates for.</param>
		/// <returns></returns>
		Task<List<Certificate>> CreateNewCertificates(int eventId, string issuedByUsername);

		Task<int> CreateRegistration(Registration registration);
		Task<int> CreateRegistration(Registration registration, int[] productIds, int[] variantIds);
		Task<bool> AddRegistrationToProduct(string email, int eventId, int productId, int? variantId);
		
		Task<int> SetRegistrationAsVerified(int id);
		Task<int> SetRegistrationAsAttended(int id);
		Task<int> SetRegistrationAsNotAttended(int id);
	}
}
