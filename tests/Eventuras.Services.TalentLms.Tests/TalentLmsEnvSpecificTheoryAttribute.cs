using Eventuras.TestAbstractions;

namespace Eventuras.Services.TalentLms.Tests;

internal class TalentLmsEnvSpecificTheoryAttribute : EnvDependentTheoryAttribute
{
    public TalentLmsEnvSpecificTheoryAttribute() : base(TalentLmsTestEnv.ApiKeyEnvKey,
        TalentLmsTestEnv.SiteNameEnvKey,
        TalentLmsTestEnv.UserIdEnvKey,
        TalentLmsTestEnv.CourseIdEnvKey) { }
}