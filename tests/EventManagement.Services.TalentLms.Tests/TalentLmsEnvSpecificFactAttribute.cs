using EventManagement.TestAbstractions;

namespace EventManagement.Services.TalentLms.Tests
{
    internal class TalentLmsEnvSpecificFactAttribute : EnvDependentFactAttribute
    {
        public TalentLmsEnvSpecificFactAttribute() : base(
            TalentLmsTestEnv.ApiKeyEnvKey,
            TalentLmsTestEnv.SiteNameEnvKey,
            TalentLmsTestEnv.UserIdEnvKey,
            TalentLmsTestEnv.CourseIdEnvKey)
        {
        }
    }
}
