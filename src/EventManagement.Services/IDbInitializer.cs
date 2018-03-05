using System.Threading.Tasks;

namespace losol.EventManagement.Services
{
	public interface IDbInitializer
	{
		Task Seed();
	}
}
