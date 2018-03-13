using System.Threading.Tasks;

namespace losol.EventManagement.Services.DbInitializers
{
	public interface IDbInitializer
	{
		Task SeedAsync();
	}
}
