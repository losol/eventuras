using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.IntegrationTests;
using Eventuras.Services.Invoicing;
using Eventuras.TestAbstractions;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Xunit;

namespace Eventuras.Web.Tests.Controllers.Api.V0;

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
        var client = factory.CreateClient();
        await client.LogInAsSuperAdminAsync();

        using var scope = factory.Services.NewTestScope();
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
                            quantity = "1",
                        },
                    },
                }),
                Encoding.UTF8,
                "application/json"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var orderId = order.Entity.OrderId;
        var orderLines = await scope.Db.OrderLines.AsNoTracking().Where(line => line.OrderId == orderId).ToArrayAsync();

        Assert.Single(orderLines);
        Assert.Equal(product.Entity.ProductId, orderLines.First().ProductId);
        Assert.Equal(1, orderLines.First().Quantity);
    }

    [Fact]
    public async Task Should_Create_Invoice_For_Order()
    {
        var client = factory.CreateClient();
        await client.LogInAsSuperAdminAsync();

        using var scope = factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var eventInfo = await scope.CreateEventAsync();
        using var registration = await scope.CreateRegistrationAsync(eventInfo.Entity, user.Entity);
        using var product = await scope.CreateProductAsync(eventInfo.Entity);
        using var order = await scope.CreateOrderAsync(registration.Entity, product.Entity);

        var response = await client.PostAsync($"/api/v0/orders/update/{order.Entity.OrderId}/invoiced", new StringContent(""));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var orderId = order.Entity.OrderId;
        var updatedOrder = await scope.Db.Orders.AsNoTracking().Include(o => o.Invoice).SingleAsync(o => o.OrderId == orderId);

        Assert.Equal(Order.OrderStatus.Invoiced, updatedOrder.Status);
        Assert.NotNull(updatedOrder.Invoice);
        Assert.NotEmpty(updatedOrder.Invoice.ExternalInvoiceId);
        Assert.False(updatedOrder.Invoice.Paid);
        Assert.Contains(TestInvoicingProvider.TestLogEntry, updatedOrder.Log);
    }

    [Fact]
    public async Task Should_Create_Invoice_For_Order_With_Unacceptable_Payment_Method()
    {
        // If no invoicing provider is registered for the given payment method,
        // the invoice should still be created but not processed,
        // means its external id should be null.

        var client = factory.CreateClient();
        await client.LogInAsSuperAdminAsync();

        using var scope = factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var eventInfo = await scope.CreateEventAsync();
        using var registration = await scope.CreateRegistrationAsync(eventInfo.Entity, user.Entity);
        using var product = await scope.CreateProductAsync(eventInfo.Entity);
        using var order = await scope.CreateOrderAsync(registration.Entity,
            product.Entity,
            paymentProvider: PaymentMethod.PaymentProvider.PowerOfficeEmailInvoice);

        var response = await client.PostAsync($"/api/v0/orders/update/{order.Entity.OrderId}/invoiced", new StringContent(""));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var orderId = order.Entity.OrderId;
        var updatedOrder = await scope.Db.Orders.AsNoTracking().Include(o => o.Invoice).SingleAsync(o => o.OrderId == orderId);

        Assert.Equal(Order.OrderStatus.Invoiced, updatedOrder.Status);
        Assert.NotNull(updatedOrder.Invoice);
        Assert.Null(updatedOrder.Invoice.ExternalInvoiceId);
        Assert.False(updatedOrder.Invoice.Paid);
        Assert.DoesNotContain(TestInvoicingProvider.TestLogEntry, updatedOrder.Log);
        Assert.Contains("No invoicing provider found for payment method PowerOfficeEmailInvoice", updatedOrder.Log);
    }

    [Fact]
    public async Task Should_Generate_Correct_Order()
    {
        var client = factory.CreateClient();
        await client.LogInAsSuperAdminAsync();

        using var scope = factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var eventInfo = await scope.CreateEventAsync();
        using var registration = await scope.CreateRegistrationAsync(eventInfo.Entity, user.Entity);
        using var product = await scope.CreateProductAsync(eventInfo.Entity, price: 100);
        using var variant = await scope.CreateProductVariantAsync(product.Entity, price: 1000);
        using var anotherProduct = await scope.CreateProductAsync(eventInfo.Entity, price: 10000);
        using var order = await scope.CreateOrderAsync(registration.Entity,
            new[] { product.Entity, anotherProduct.Entity },
            new[] { variant.Entity, null });

        var response = await client.PostAsync($"/api/v0/orders/update/{order.Entity.OrderId}/invoiced", new StringContent(""));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var orderId = order.Entity.OrderId;
        var updatedOrder = await scope.Db.Orders.AsNoTracking().Include(o => o.Invoice).SingleAsync(o => o.OrderId == orderId);

        Assert.Equal(Order.OrderStatus.Invoiced, updatedOrder.Status);
        Assert.NotNull(updatedOrder.Invoice);
        Assert.NotEmpty(updatedOrder.Invoice.ExternalInvoiceId);
        Assert.False(updatedOrder.Invoice.Paid);
        Assert.Contains(TestInvoicingProvider.TestLogEntry, updatedOrder.Log);

        var info = TestInvoicingProvider.LastInvoiceInfo;
        Assert.NotNull(info);
        Assert.Equal(user.Entity.Email, info.CustomerEmail);
        Assert.Equal(user.Entity.Name, info.CustomerName);
        Assert.Equal(order.Entity.OrderId.ToString(), info.OrderId);
        Assert.Equal(order.Entity.OrderTime.ToLocalDate(), info.OrderDate);

        var lines = info.Lines.ToArray();
        Assert.Equal(3, info.Lines.Count);

        var orderLine = lines[0];
        Assert.Equal(InvoiceLineType.Text, orderLine.Type);
        Assert.Equal($"Deltakelse for {user.Entity.Name} på {eventInfo.Entity.Title}", orderLine.Description);

        var productVariantLine = lines[1];
        Assert.Equal(InvoiceLineType.Product, productVariantLine.Type);
        Assert.Equal($"{product.Entity.Name} ({variant.Entity.Name})", productVariantLine.Description);
        Assert.Equal($"K{product.Entity.ProductId}-{variant.Entity.ProductVariantId}", productVariantLine.ProductCode);
        Assert.Equal(variant.Entity.Description, productVariantLine.ProductDescription);
        Assert.Equal(variant.Entity.Price, productVariantLine.Price);
        Assert.Equal(1, productVariantLine.Quantity);
        Assert.Equal(1050, productVariantLine.Total);

        var noVariantLine = lines[2];
        Assert.Equal(InvoiceLineType.Product, noVariantLine.Type);
        Assert.Equal(anotherProduct.Entity.Name, noVariantLine.Description);
        Assert.Equal($"K{anotherProduct.Entity.ProductId}", noVariantLine.ProductCode);
        Assert.Equal(anotherProduct.Entity.Description, noVariantLine.ProductDescription);
        Assert.Equal(anotherProduct.Entity.Price, noVariantLine.Price);
        Assert.Equal(1, noVariantLine.Quantity);
        Assert.Equal(10500, noVariantLine.Total);
    }
}