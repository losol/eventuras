using Microsoft.Extensions.Logging;
using Xunit;

namespace Eventuras.TestAbstractions;

public static class XUnitLoggerFactory
{
    public static ILogger<T> CreateLogger<T>(ITestOutputHelper output)
    {
        var loggerFactory = new LoggerFactory();
        loggerFactory.AddProvider(new XUnitLoggerProvider(output));
        return loggerFactory.CreateLogger<T>();
    }
}
