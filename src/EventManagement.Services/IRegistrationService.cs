using System.Threading.Tasks;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Services
{
	public interface IRegistrationService
	{
		Task<Registration> GetAsync(int id);
		Task<Registration> GetAsync(string userId, int eventId);
		Task<Registration> GetWithEventInfoAsync(int id);

		Task<int> CreateRegistrationForUser(Registration registration, int[] productIds, int[] variantIds);
		Task<int> CreateRegistrationForUser(Registration registration, int[] productIds);
		Task<int> SetRegistrationAsVerified(int id);
	}
}
