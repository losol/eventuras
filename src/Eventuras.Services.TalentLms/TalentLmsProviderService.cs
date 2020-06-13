using Eventuras.Domain;
using Eventuras.Services.Extensions;
using Eventuras.Services.Lms;
using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Eventuras.Services.TalentLms
{
    internal class TalentLmsProviderService : ILmsProviderService
    {
        private const string ProviderName = "talentlms";
        public string Name => ProviderName;

        private readonly ITalentLmsApiService _apiService;

        public TalentLmsProviderService(ITalentLmsApiService apiService)
        {
            _apiService = apiService;
        }

        public async Task<NewLmsAccountInfo> CreateAccountForUserAsync(Registration registration)
        {
            if (registration == null)
            {
                throw new ArgumentNullException(nameof(registration));
            }

            if (!registration.Verified)
            {
                throw new InvalidOperationException($"Registration {registration.RegistrationId} is not verified");
            }

            var user = registration.User;
            //if (user.Archived)
            //{
            //    throw new InvalidOperationException($"User {user.Id} is archived");
            //}

            //if (!user.EmailConfirmed)
            //{
            //    throw new InvalidOperationException($"User {user.Id} email {user.Email} is not confirmed yet");
            //}

            // TODO: check other registration rules?

            // we will use Auth0 as auth provider, no password will be required
            // but to fill the required information we generate it here.
            var password = PasswordHelper.GeneratePassword(6);
            var lastName = registration.ParticipantLastName ?? "Unspecified";
            var login = new Regex("[^a-z0-9@_\\-\\.]").Replace(user.UserName, "-");

            var response = await _apiService.UserSignUpAsync(new TalentLmsUserSignUpRequest
            {
                FirstName = registration.ParticipantFirstName,
                LastName = lastName,
                Login = login,
                Email = user.Email,
                Password = password
            });

            return new NewLmsAccountInfo
            {
                Id = response.Id,
                Password = password,
                Name = $"{response.FirstName} {response.LastName}"
            };
        }

        public async Task EnrollUserToCourseAsync(string lmsAccountId, string lmsCourseId)
        {
            if (string.IsNullOrEmpty(lmsAccountId))
            {
                throw new ArgumentException(nameof(lmsAccountId));
            }

            if (string.IsNullOrEmpty(lmsCourseId))
            {
                throw new ArgumentException(nameof(lmsCourseId));
            }

            await _apiService.EnrollUserToCourseAsync(new TalentLmsEnrollmentDto
            {
                UserId = lmsAccountId,
                CourseId = lmsCourseId,
                Role = TalentLmsEnrollmentDto.Learner // TODO: Instructor role support?
            });
        }
    }
}
