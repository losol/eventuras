using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Services
{
	public interface IRegistrationService
	{
		Task<Registration> GetAsync(int id);
		Task<Registration> GetAsync(string userId, int eventId);
		Task<Registration> GetWithOrdersAsync(int id);
		Task<Registration> GetWithEventInfoAsync(int id);
		Task<Registration> GetWithEventInfoAndOrders (int id);
		Task<List<Registration>> GetRegistrations(int eventId);
		Task<List<Registration>> GetRegistrationsWithOrders(int eventId);
		
		Task<int> CreateRegistration(Registration registration);
		Task<int> CreateRegistration(Registration registration, int[] productIds, int[] variantIds);
		[Obsolete]
		Task<bool> AddProductToRegistration(string email, int eventId, int productId, int? variantId);
		Task<bool> CreateOrUpdateOrder(int registrationId, int[] products, int[] variants);
		Task<bool> CreateOrUpdateOrder(int registrationId, int productId, int? variantId);
		
		Task<int> SetRegistrationAsVerified(int id);
		Task<int> SetRegistrationAsAttended(int id);
		Task<int> SetRegistrationAsNotAttended(int id);
	}
}
