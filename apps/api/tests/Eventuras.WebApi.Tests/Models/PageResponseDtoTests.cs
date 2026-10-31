using System.Threading;
using System.Threading.Tasks;
using Eventuras.Services;
using Eventuras.WebApi.Models;
using Xunit;

namespace Eventuras.WebApi.Tests.Models;

public class PageResponseDtoTests
{
    [Fact]
    public async Task FromPagingAsync_ShouldMapSequentially()
    {
        var paging = new Paging<int>(new[] { 1, 2, 3, 4, 5 }, 5);
        var running = 0;
        var maxRunning = 0;

        var result = await PageResponseDto<int>.FromPagingAsync(
            new PageQueryDto(),
            paging,
            async i =>
            {
                var now = Interlocked.Increment(ref running);
                maxRunning = System.Math.Max(maxRunning, now);
                await Task.Delay(10);
                Interlocked.Decrement(ref running);
                return i * 10;
            });

        Assert.Equal(1, maxRunning);
        Assert.Equal(new[] { 10, 20, 30, 40, 50 }, result.Data);
        Assert.Equal(5, result.Total);
    }
}
