using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Eventuras.IntegrationTests;
using Eventuras.TestAbstractions;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Xunit;

namespace Eventuras.Web.Tests.Controllers.Api.V0
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

            using var scope = this.factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();
            using var eventInfo = await scope.CreateEventAsync();
            using var registration = await scope.CreateRegistrationAsync(eventInfo.Entity, user.Entity);
            using var product = await scope.CreateProductAsync(eventInfo.Entity);
            using var order = await scope.CreateOrderAsync(registration.Entity);

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
            var orderLines = await scope.Db.OrderLines.AsNoTracking()
                .Where(line => line.OrderId == orderId)
                .ToArrayAsync();

            Assert.Single(orderLines);
            Assert.Equal(product.Entity.ProductId, orderLines.First().ProductId);
            Assert.Equal(1, orderLines.First().Quantity);
        }
    }
}
