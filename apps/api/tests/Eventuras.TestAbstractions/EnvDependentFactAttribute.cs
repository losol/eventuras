using System;
using System.Linq;
using Xunit;

namespace Eventuras.TestAbstractions;

public class EnvDependentFactAttribute : FactAttribute
{
    public EnvDependentFactAttribute(params string[] envVariableNames)
    {
        EnvVariableNames = envVariableNames;

        if (EnvVariableNames.Any(name => string.IsNullOrEmpty(Environment.GetEnvironmentVariable(name))))
        {
            Skip = $"To enable this test, specify the following environment variables: {string.Join(", ", EnvVariableNames)}";
        }
    }

    public string[] EnvVariableNames { get; set; }
}
