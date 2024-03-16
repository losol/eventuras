using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Moq;
using Xunit;

namespace Losol.Communication.HealthCheck.Abstractions.Tests
{
    public class PeriodicHealthCheckTests
    {
        private readonly Mock<IHealthCheckService> _serviceMock = new Mock<IHealthCheckService>();
        private readonly Mock<IHealthCheckStorage> _storageMock = new Mock<IHealthCheckStorage>();

        [Fact]
        public async Task Should_Check_Status_If_No_Current()
        {
            _storageMock.Setup(s => s.GetCurrentStatusAsync(It.IsAny<string>()))
                .ReturnsAsync((HealthCheckStatus)null);

            var healthCheckStatus = new HealthCheckStatus(HealthStatus.Healthy);
            _serviceMock.Setup(s => s.CheckHealthAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(healthCheckStatus);

            var check = new TestPeriodicHealthCheck(_storageMock.Object, _serviceMock.Object, TimeSpan.FromMinutes(1));
            var status = await check.CheckHealthAsync(new HealthCheckContext());
            Assert.Equal(Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Healthy, status.Status);
            Assert.Null(status.Exception);
            Assert.Null(status.Description);

            _serviceMock.Verify(s => s.CheckHealthAsync(It.IsAny<CancellationToken>()), Times.Once);
            _storageMock.Verify(s => s.CheckedAsync(TestPeriodicHealthCheck.CheckServiceName, healthCheckStatus), Times.Once);
        }

        [Fact]
        public async Task Should_Check_Status_If_Outdated()
        {
            var oldHealthCheckStatus =
                new HealthCheckStatus(HealthStatus.Unhealthy, "Some error message")
                {
                    DateTime = DateTime.UtcNow.AddMinutes(-2)
                };

            _storageMock.Setup(s => s.GetCurrentStatusAsync(It.IsAny<string>()))
                .ReturnsAsync(oldHealthCheckStatus);

            var newHealthCheckStatus = new HealthCheckStatus(HealthStatus.Healthy);
            _serviceMock.Setup(s => s.CheckHealthAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(newHealthCheckStatus);

            var check = new TestPeriodicHealthCheck(_storageMock.Object, _serviceMock.Object, TimeSpan.FromMinutes(1));
            var status = await check.CheckHealthAsync(new HealthCheckContext());
            Assert.Equal(Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Healthy, status.Status);
            Assert.Null(status.Exception);
            Assert.Null(status.Description);

            _serviceMock.Verify(s => s.CheckHealthAsync(It.IsAny<CancellationToken>()), Times.Once);
            _storageMock.Verify(s => s.CheckedAsync(TestPeriodicHealthCheck.CheckServiceName, newHealthCheckStatus), Times.Once);
        }

        [Fact]
        public async Task Should_Not_Check_Status_If_Not_Outdated()
        {
            var oldHealthCheckStatus =
                new HealthCheckStatus(HealthStatus.Unhealthy, "Some error message")
                {
                    DateTime = DateTime.UtcNow.AddSeconds(-30)
                };

            _storageMock.Setup(s => s.GetCurrentStatusAsync(It.IsAny<string>()))
                .ReturnsAsync(oldHealthCheckStatus);

            var check = new TestPeriodicHealthCheck(_storageMock.Object, _serviceMock.Object, TimeSpan.FromMinutes(1));
            var status = await check.CheckHealthAsync(new HealthCheckContext());
            Assert.Equal(Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Unhealthy, status.Status);
            Assert.Null(status.Exception);
            Assert.Equal(oldHealthCheckStatus.ErrorMessage, status.Description);

            _serviceMock.Verify(s => s.CheckHealthAsync(It.IsAny<CancellationToken>()), Times.Never);
            _storageMock.Verify(s => s.CheckedAsync(It.IsAny<string>(), It.IsAny<HealthCheckStatus>()), Times.Never);
        }
    }
}
