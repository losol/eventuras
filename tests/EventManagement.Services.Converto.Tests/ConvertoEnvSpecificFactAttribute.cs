using EventManagement.TestAbstractions;

namespace EventManagement.Services.Converto.Tests
{
    internal class ConvertoEnvSpecificFactAttribute : EnvDependentFactAttribute
    {
        public ConvertoEnvSpecificFactAttribute() : base(
            ConvertoTestEnv.ApiBaseUriEnvKey,
            ConvertoTestEnv.UsernameEnvKey,
            ConvertoTestEnv.PasswordEnvKey)
        {
        }
    }
}
