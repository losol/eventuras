using System;

namespace Eventuras.Services.TalentLms.Tests
{
    internal static class TalentLmsTestEnv
    {
        public const string SiteNameEnvKey = "EVTMGMT_TALENTLMS_TEST_SITE_NAME";
        public const string ApiKeyEnvKey = "EVTMGMT_TALENTLMS_TEST_API_KEY";
        public const string UserIdEnvKey = "EVTMGMT_TALENTLMS_TEST_USER_ID";
        public const string CourseIdEnvKey = "EVTMGMT_TALENTLMS_TEST_COURSE_ID";

        public static TalentLmsSettings GetSettingsFromEnv()
        {
            return new TalentLmsSettings
            {
                SiteName = Environment.GetEnvironmentVariable(SiteNameEnvKey),
                ApiKey = Environment.GetEnvironmentVariable(ApiKeyEnvKey)
            };
        }
    }
}
