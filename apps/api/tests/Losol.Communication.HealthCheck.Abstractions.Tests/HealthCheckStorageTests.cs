using System;
using System.Threading.Tasks;
using Xunit;

namespace Losol.Communication.HealthCheck.Abstractions.Tests
{
    public class HealthCheckStorageTests
    {
        [Theory]
        [MemberData(nameof(GetStorage))]
        public async Task Should_Return_Null_When_Getting_Status_Without_Check_Performed(IHealthCheckStorage storage)
        {
            Assert.Null(await storage.GetCurrentStatusAsync("test"));
        }

        [Theory]
        [MemberData(nameof(GetStorage))]
        public async Task Should_Store_Checks_For_Separate_Services(IHealthCheckStorage storage)
        {
            var unhealthy = new HealthCheckStatus(HealthStatus.Unhealthy);
            var healthy = new HealthCheckStatus(HealthStatus.Healthy);

            await storage.CheckedAsync("s1", unhealthy);
            await storage.CheckedAsync("s2", healthy);

            Assert.Equal(unhealthy, await storage.GetCurrentStatusAsync("s1"));
            Assert.Equal(healthy, await storage.GetCurrentStatusAsync("s2"));
        }

        [Theory]
        [MemberData(nameof(GetStorage))]
        public async Task Should_Not_Replace_Newest_Value(IHealthCheckStorage storage)
        {
            var olderCheck = new HealthCheckStatus(HealthStatus.Unhealthy) { DateTime = DateTime.UtcNow.AddSeconds(-1) };
            var newerCheck = new HealthCheckStatus(HealthStatus.Healthy);

            await storage.CheckedAsync("test", newerCheck);
            Assert.Equal(newerCheck, await storage.GetCurrentStatusAsync("test"));

            await storage.CheckedAsync("test", olderCheck);
            Assert.Equal(newerCheck, await storage.GetCurrentStatusAsync("test"));
        }

        [Theory]
        [MemberData(nameof(GetStorage))]
        public async Task Should_Replace_Older_Value(IHealthCheckStorage storage)
        {
            var olderCheck = new HealthCheckStatus(HealthStatus.Unhealthy) { DateTime = DateTime.UtcNow.AddSeconds(-1) };
            var newerCheck = new HealthCheckStatus(HealthStatus.Healthy);

            await storage.CheckedAsync("test", olderCheck);
            Assert.Equal(olderCheck, await storage.GetCurrentStatusAsync("test"));

            await storage.CheckedAsync("test", newerCheck);
            Assert.Equal(newerCheck, await storage.GetCurrentStatusAsync("test"));
        }

        public static object[][] GetStorage()
        {
            return new[]
            {
                new object[] {new HealthCheckMemoryStorage(),},
            };
        }
    }
}
