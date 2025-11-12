using System;
using Microsoft.Extensions.Logging;
using Xunit;

namespace Eventuras.TestAbstractions;

public interface IWriter
{
    void WriteLine(string str);
}

public class BaseTest : IWriter
{
    public BaseTest(ITestOutputHelper output) => Output = output;
    public ITestOutputHelper Output { get; }

    public void WriteLine(string str)
    {
        try
        {
            Output.WriteLine(str ?? Environment.NewLine);
        }
        catch (InvalidOperationException)
        {
            // There is no currently active test. Skipping.
        }
    }
}

public class XUnitLoggerProvider : ILoggerProvider
{
    public XUnitLoggerProvider(ITestOutputHelper output) => Writer = new BaseTest(output);
    public IWriter Writer { get; }
    public LogLevel MinLevel { get; set; } = LogLevel.Information;

    public void Dispose()
    {
    }

    public ILogger CreateLogger(string categoryName) => new XUnitLogger(Writer, MinLevel);

    public class XUnitLogger : ILogger
    {
        private readonly LogLevel _minLevel;

        public XUnitLogger(IWriter writer, LogLevel minLevel)
        {
            Writer = writer;
            _minLevel = minLevel;
            Name = nameof(XUnitLogger);
        }

        public IWriter Writer { get; }

        public string Name { get; set; }

        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception exception,
            Func<TState, Exception, string> formatter)
        {
            if (!IsEnabled(logLevel))
            {
                return;
            }

            if (formatter == null)
            {
                throw new ArgumentNullException(nameof(formatter));
            }

            var message = formatter(state, exception);
            if (string.IsNullOrEmpty(message) && exception == null)
            {
                return;
            }

            var line = $"{logLevel}: {Name}: {message}";

            Writer.WriteLine(line);

            if (exception != null)
            {
                Writer.WriteLine(exception.ToString());
            }
        }

        public bool IsEnabled(LogLevel logLevel) => logLevel >= _minLevel;

        public IDisposable BeginScope<TState>(TState state) => new XUnitScope();
    }

    public class XUnitScope : IDisposable
    {
        public void Dispose()
        {
        }
    }
}
