using losol.EventManagement.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Xunit;

namespace losol.EventManagement.IntegrationTests.Pages.Admin.Events
{
    public class ProductsPageTests : IClassFixture<CustomWebApplicationFactory<Startup>>
    {
        private readonly CustomWebApplicationFactory<Startup> factory;

        public ProductsPageTests(CustomWebApplicationFactory<Startup> factory)
        {
            this.factory = factory;
        }

        [Fact]
        public async Task Should_Add_Products_To_Event()
        {
            var client = this.factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = this.factory.Services.NewScope();
            using var user = await scope.ServiceProvider.CreateUserAsync();

            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            using var eventInfo = await context.CreateEventAsync();

            var response = await client.PostAsync($"/Admin/Events/Products/{eventInfo.Entity.EventInfoId}",
                new Dictionary<string, string>
                {
                    { "Vm.EventInfoId", eventInfo.Entity.EventInfoId.ToString() },
                    { "Vm.Products[0].Name", "Test Product 1 With No Variants" },
                    { "Vm.Products[1].Name", "Test Product 2 With 2 Variants" },
                    { "Vm.Products[1].ProductVariants[0].Name", "Variant 1" },
                    { "Vm.Products[1].ProductVariants[1].Name", "Variant 2" }
                });
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var updatedEvent = await context.EventInfos.AsNoTracking()
                .Include(e => e.Products)
                .ThenInclude(p => p.ProductVariants)
                .FirstOrDefaultAsync(e => e.EventInfoId == eventInfo.Entity.EventInfoId);

            Assert.NotNull(updatedEvent);

            var products = updatedEvent.Products
                .OrderBy(p => p.Name)
                .ToArray();

            Assert.Equal(2, products.Length);
            Assert.Equal("Test Product 1 With No Variants", products[0].Name);
            Assert.Empty(products[0].ProductVariants);

            Assert.Equal("Test Product 2 With 2 Variants", products[1].Name);
            Assert.Equal(new[] { "Variant 1", "Variant 2" }, products[1].ProductVariants
                .OrderBy(v => v.Name)
                .Select(v => v.Name)
                .ToArray());
        }
    }
}
