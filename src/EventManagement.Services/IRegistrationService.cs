using System.Threading.Tasks;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Services
{
	public interface IRegistrationService
	{
		Task<Registration> GetAsync(int id);
		Task<Registration> GetWithEventInfoAsync(int id);

		Task<int> SetRegistrationAsVerified(int id);
	}
}
