using System;
using System.Threading.Tasks;

namespace Eventuras.Services.TalentLms.Tests
{
    internal static class TalentLmsApiServiceTestExtensions
    {
        public static async Task DeleteAllUsersAsync(this ITalentLmsApiService service)
        {
            var adminUserId = Environment.GetEnvironmentVariable(TalentLmsTestEnv.UserIdEnvKey);
            if (string.IsNullOrWhiteSpace(adminUserId))
            {
                throw new InvalidOperationException($"{TalentLmsTestEnv.UserIdEnvKey} env variable is not set");
            }

            var users = await service.ListAllUsersAsync();
            foreach (var user in users)
            {
                if (!adminUserId.Equals(user.Id))
                {
                    await service.DeleteUserAsync(user.Id, adminUserId);
                }
            }
        }
    }
}
