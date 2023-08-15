using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Extensions;
using Eventuras.Services.ExternalSync;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.TalentLms;

internal class TalentLmsProviderService : AbstractExternalAccountPerUserSyncProviderService
{
    public override string Name => "TalentLMS";

    private readonly ITalentLmsApiService _apiService;

    public TalentLmsProviderService(
        ITalentLmsApiService apiService,
        ApplicationDbContext context,
        ILogger<TalentLmsProviderService> logger) : base(context, logger)
    {
        _apiService = apiService ?? throw new ArgumentNullException(nameof(apiService));
    }

    protected override async Task<ExternalAccount> CreateNewExternalAccountForRegistrationAsync(Registration registration)
    {
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
        var password = PasswordHelper.GeneratePassword();
        var lastName = registration.ParticipantLastName ?? "Unspecified";
        var login = new Regex("[^a-z0-9@_\\-\\.]").Replace(user.UserName, "-");

        var response = await _apiService.UserSignUpAsync(new TalentLmsUserSignUpRequest
        {
            FirstName = registration.ParticipantFirstName,
            LastName = lastName,
            Login = login,
            Email = user.Email,
            Password = password,
        });

        return new ExternalAccount
        {
            UserId = registration.UserId,
            ExternalAccountId = response.Id,
            ExternalServiceName = Name,
            DisplayName = $"{response.FirstName} {response.LastName}",
        };
    }

    protected override async Task RegisterUserToExternalEventAsync(ExternalAccount account, ExternalEvent externalEvent)
    {
        await _apiService.EnrollUserToCourseAsync(new TalentLmsEnrollmentDto
        {
            UserId = account.ExternalAccountId,
            CourseId = externalEvent.ExternalEventId,
            Role = TalentLmsEnrollmentDto.Learner, // TODO: Instructor role support?
        });
    }
}