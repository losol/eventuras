using EventManagement.TestAbstractions;

namespace EventManagement.Services.TalentLms.Tests
{
    internal class TalentLmsEnvSpecificTheoryAttribute : EnvDependentTheoryAttribute
    {
        public TalentLmsEnvSpecificTheoryAttribute() : base(
            TalentLmsTestEnv.ApiKeyEnvKey,
            TalentLmsTestEnv.SiteNameEnvKey,
            TalentLmsTestEnv.UserIdEnvKey,
            TalentLmsTestEnv.CourseIdEnvKey)
        {
        }
    }
}
