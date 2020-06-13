using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services.Lms
{
    public interface ILmsProviderService
    {
        string Name { get; }

        Task<NewLmsAccountInfo> CreateAccountForUserAsync(Registration registration);

        Task EnrollUserToCourseAsync(string lmsAccountId, string lmsCourseId);
    }

    public class NewLmsAccountInfo
    {
        public string Id { get; set; }

        public string Name { get; set; }

        public string Password { get; set; }
    }
}
