using System.Threading.Tasks;

namespace EventManagement.Services.TalentLms
{
    internal interface ITalentLmsApiService
    {
        Task<TalentLmsUserDto> UserSignUpAsync(TalentLmsUserSignUpRequest request);

        Task<TalentLmsEnrollmentDto> EnrollUserToCourseAsync(TalentLmsEnrollmentDto request);

        Task<TalentLmsUserDto[]> ListAllUsersAsync();

        Task DeleteUserAsync(string userId, string deletedByUserId);
    }
}
