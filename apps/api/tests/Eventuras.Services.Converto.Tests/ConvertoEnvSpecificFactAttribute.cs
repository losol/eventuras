using Eventuras.TestAbstractions;

namespace Eventuras.Services.Converto.Tests;

internal class ConvertoEnvSpecificFactAttribute : EnvDependentFactAttribute
{
    public ConvertoEnvSpecificFactAttribute() : base(
        ConvertoTestEnv.PdfEndpointUrl,
        ConvertoTestEnv.TokenEndpointUrl,
        ConvertoTestEnv.ClientId,
        ConvertoTestEnv.ClientSecret)
    {
    }
}
