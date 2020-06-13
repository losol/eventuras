using Eventuras.Domain;
using System;
using System.Threading.Tasks;

namespace Eventuras.Services.Lms
{
    internal class DefaultLmsProviderService : ILmsProviderService
    {
        public string Name => "default";

        public Task<NewLmsAccountInfo> CreateAccountForUserAsync(Registration registration)
        {
            throw new NotImplementedException();
        }

        public Task EnrollUserToCourseAsync(string lmsAccountId, string lmsCourseId)
        {
            throw new NotImplementedException();
        }
    }
}
