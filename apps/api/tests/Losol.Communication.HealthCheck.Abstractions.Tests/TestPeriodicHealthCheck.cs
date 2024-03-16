using System;

namespace Losol.Communication.HealthCheck.Abstractions.Tests
{
    public class TestPeriodicHealthCheck : AbstractPeriodicHealthCheck
    {
        public const string CheckServiceName = "test";

        public TestPeriodicHealthCheck(
            IHealthCheckStorage healthCheckStorage,
            IHealthCheckService healthCheckService,
            TimeSpan checkPeriod) : base(healthCheckStorage, healthCheckService)
        {
            CheckPeriod = checkPeriod;
        }

        protected override string ServiceName => CheckServiceName;

        protected override TimeSpan CheckPeriod { get; }
    }
}
