using System.Linq;
using Eventuras.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Eventuras.IntegrationTests.Controllers.Api.V0
{
    public class OrdersControllerTest : IClassFixture<CustomWebApplicationFactory<Startup>>
    {
        private readonly CustomWebApplicationFactory<Startup> factory;

        public OrdersControllerTest(CustomWebApplicationFactory<Startup> factory)
        {
            this.factory = factory;
        }

        [Fact]
        public async Task Should_Update_Existing_Order_Using_Strings()
        {
            var client = this.factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = this.factory.Services.NewScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            using var user = await scope.ServiceProvider.CreateUserAsync();
            using var eventInfo = await context.CreateEventAsync();
            using var registration = await context.CreateRegistrationAsync(eventInfo.Entity, user.Entity);
            using var product = await context.CreateProductAsync(eventInfo.Entity);
            using var order = await context.CreateOrderAsync(registration.Entity);

            var response = await client.PostAsync("/api/v0/orders/update-order",
                new StringContent(JsonConvert.SerializeObject(new
                {
                    registrationId = registration.Entity.RegistrationId,
                    products = new[]
                    {
                        new
                        {
                            id = product.Entity.ProductId.ToString(),
                            quantity = "1"
                        }
                    }
                }), Encoding.UTF8, "application/json"));

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var orderId = order.Entity.OrderId;
            var orderLines = await context.OrderLines.AsNoTracking()
                .Where(line => line.OrderId == orderId)
                .ToArrayAsync();

            Assert.Single(orderLines);
            Assert.Equal(product.Entity.ProductId, orderLines.First().ProductId);
            Assert.Equal(1, orderLines.First().Quantity);
        }
    }
}
