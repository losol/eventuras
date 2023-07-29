using Eventuras.TestAbstractions;

namespace Eventuras.Services.Converto.Tests
{
    internal class ConvertoEnvSpecificFactAttribute : EnvDependentFactAttribute
    {
        public ConvertoEnvSpecificFactAttribute() : base(
            ConvertoTestEnv.ApiBaseUri,
            ConvertoTestEnv.ApiToken)
        {
        }
    }
}
