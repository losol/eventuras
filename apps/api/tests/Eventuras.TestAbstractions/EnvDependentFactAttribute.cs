using System;
using System.Linq;
using Xunit;

namespace Eventuras.TestAbstractions;

public class EnvDependentFactAttribute : FactAttribute
{
    public string[] EnvVariableNames { get; set; }

    public EnvDependentFactAttribute(params string[] envVariableNames)
    {
        EnvVariableNames = envVariableNames;
    }

    public override string Skip
    {
        get
        {
            return EnvVariableNames.Any(name => string.IsNullOrEmpty(Environment.GetEnvironmentVariable(name)))
                ? $"To enable this test, specify the following environment variables: {string.Join(", ", EnvVariableNames)}"
                : base.Skip;
        }
        set => base.Skip = value;
    }
}
