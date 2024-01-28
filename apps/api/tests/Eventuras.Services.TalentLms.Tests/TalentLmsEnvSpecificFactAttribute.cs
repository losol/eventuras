using Eventuras.TestAbstractions;

namespace Eventuras.Services.TalentLms.Tests
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
