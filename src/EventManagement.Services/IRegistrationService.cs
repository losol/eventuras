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
		Task<Registration> GetWithUserAndEventInfoAsync(int id);
		Task<Registration> GetWithUserAndEventInfoAndOrders (int id);
		Task<List<Registration>> GetRegistrations(int eventId);
		Task<List<Registration>> GetRegistrationsWithOrders(int eventId);
		Task<List<Registration>> GetRegistrationsWithOrders(ApplicationUser user);
		
		Task<int> CreateRegistration(Registration registration);
		Task<int> CreateRegistration(Registration registration, int[] productIds, int[] variantIds);
		[Obsolete]
		Task<bool> AddProductToRegistration(string email, int eventId, int productId, int? variantId);
		Task<bool> CreateOrUpdateOrder(int registrationId, int[] products, int[] variants);
		Task<bool> CreateOrUpdateOrder(int registrationId, int productId, int? variantId);
		

		Task<bool> UpdateParticipantInfo(int registrationId, string name, string JobTitle, string city, string Employer);
		Task<bool> UpdateRegistrationStatus(int registrationId, Registration.RegistrationStatus registrationStatus);

		Task<bool> UpdateRegistrationType(int registrationId, Registration.RegistrationType registrationType);
		// Set status
		Task<int> SetRegistrationAsVerified(int id);
		Task<int> SetRegistrationAsAttended(int id);
		Task<int> SetRegistrationAsNotAttended(int id);
	}
}
