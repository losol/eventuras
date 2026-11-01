using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.TestAbstractions;
using Microsoft.EntityFrameworkCore;
using Xunit;
using static Eventuras.Domain.PaymentMethod;

namespace Eventuras.WebApi.Tests.Controllers.Registrations;

/// <summary>
///     The payer step: who pays the invoice, and whether those details reach the orders
///     that the invoice is made from.
/// </summary>
public class RegistrationPayerTests(CustomWebApiApplicationFactory<Program> factory)
    : IClassFixture<CustomWebApiApplicationFactory<Program>>
{
    private static object OtherOrganizationPayer(string? invoiceReference = "12345") => new
    {
        payerType = "OtherOrganization",
        name = "Oslo kommune",
        vatNumber = "974760673",
        email = "per.hansen@example.com",
        address = "Rådhusplassen 1",
        zip = "0037",
        city = "Oslo",
        country = "Norway",
        invoiceReference,
        contactName = "Per Hansen"
    };

    [Fact]
    public async Task Post_Should_Copy_Organization_Payer_To_The_Created_Order()
    {
        using var scope = factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var e = await scope.CreateEventAsync(status: EventInfo.EventInfoStatus.RegistrationsOpen);
        using var product = await scope.CreateProductAsync(e.Entity, minimumQuantity: 1);

        var client = factory.CreateClient().AuthenticatedAs(user.Entity);
        var response = await client.PostAsync("/v3/registrations", new
        {
            userId = user.Entity.Id,
            eventId = e.Entity.EventInfoId,
            createOrder = true,
            products = new[] { new { productId = product.Entity.ProductId, quantity = 1 } },
            paymentMethod = "PowerOfficeEHFInvoice",
            customer = OtherOrganizationPayer()
        });
        response.CheckOk();

        var reg = await scope.Db.Registrations.AsNoTracking()
            .Include(r => r.Orders)
            .SingleAsync(r => r.EventInfoId == e.Entity.EventInfoId && r.UserId == user.Entity.Id);

        Assert.Equal(Registration.RegistrationPayerType.OtherOrganization, reg.PayerType);
        Assert.Equal("Per Hansen", reg.CustomerContactName);
        Assert.Equal("Rådhusplassen 1", reg.CustomerAddress);

        var order = Assert.Single(reg.Orders);
        Assert.Equal("Oslo kommune", order.CustomerName);
        Assert.Equal("per.hansen@example.com", order.CustomerEmail);
        Assert.Equal("974760673", order.CustomerVatNumber);
        Assert.Equal("12345", order.CustomerInvoiceReference);
        Assert.Equal(PaymentProvider.PowerOfficeEHFInvoice, order.PaymentMethod);
    }

    [Fact]
    public async Task Put_Should_Copy_Payer_To_Open_Orders_Only()
    {
        using var scope = factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var e = await scope.CreateEventAsync();
        using var product = await scope.CreateProductAsync(e.Entity);
        using var reg = await scope.CreateRegistrationAsync(e.Entity, user.Entity);
        using var openOrder = await scope.CreateOrderAsync(reg.Entity, product.Entity);
        using var invoicedOrder = await scope.CreateOrderAsync(reg.Entity, product.Entity,
            status: Order.OrderStatus.Invoiced);

        var client = factory.CreateClient().AuthenticatedAsSystemAdmin();
        var response = await client.PutAsync($"/v3/registrations/{reg.Entity.RegistrationId}", new
        {
            paymentMethod = "PowerOfficeEHFInvoice",
            customer = OtherOrganizationPayer()
        });
        response.CheckOk();

        var dto = await response.AsTokenAsync();
        Assert.Equal("OtherOrganization", dto.GetProperty("payerType").GetString());
        Assert.Equal("Oslo kommune", dto.GetProperty("customerName").GetString());
        Assert.Equal("Per Hansen", dto.GetProperty("customerContactName").GetString());
        Assert.Equal("Rådhusplassen 1", dto.GetProperty("customerAddress").GetString());

        var orders = await scope.Db.Orders.AsNoTracking()
            .Where(o => o.RegistrationId == reg.Entity.RegistrationId)
            .ToListAsync();

        var open = orders.Single(o => o.OrderId == openOrder.Entity.OrderId);
        Assert.Equal("Oslo kommune", open.CustomerName);
        Assert.Equal("974760673", open.CustomerVatNumber);
        Assert.Equal(PaymentProvider.PowerOfficeEHFInvoice, open.PaymentMethod);

        var invoiced = orders.Single(o => o.OrderId == invoicedOrder.Entity.OrderId);
        Assert.Null(invoiced.CustomerVatNumber);
        Assert.Equal(PaymentProvider.EmailInvoice, invoiced.PaymentMethod);
    }

    [Fact]
    public async Task Put_Should_Leave_Orders_Alone_When_Payer_Is_Unchanged()
    {
        using var scope = factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var e = await scope.CreateEventAsync();
        using var product = await scope.CreateProductAsync(e.Entity);
        using var reg = await scope.CreateRegistrationAsync(e.Entity, user.Entity);
        using var order = await scope.CreateOrderAsync(reg.Entity, product.Entity,
            paymentProvider: PaymentProvider.StripeInvoice);

        var client = factory.CreateClient().AuthenticatedAsSystemAdmin();
        var response = await client.PutAsync($"/v3/registrations/{reg.Entity.RegistrationId}", new { type = 2 });
        response.CheckOk();

        var unchanged = await scope.Db.Orders.AsNoTracking().SingleAsync(o => o.OrderId == order.Entity.OrderId);
        Assert.Equal(PaymentProvider.StripeInvoice, unchanged.PaymentMethod);
    }

    [Fact]
    public async Task Put_Should_Require_Invoice_Reference_When_Another_Organization_Pays()
    {
        using var scope = factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var e = await scope.CreateEventAsync();
        using var reg = await scope.CreateRegistrationAsync(e.Entity, user.Entity);

        var client = factory.CreateClient().AuthenticatedAsSystemAdmin();
        var response = await client.PutAsync($"/v3/registrations/{reg.Entity.RegistrationId}", new
        {
            customer = OtherOrganizationPayer(invoiceReference: " ")
        });
        response.CheckBadRequest();
    }

    [Fact]
    public async Task Put_Should_Require_Organization_Details_For_Own_Company()
    {
        using var scope = factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var e = await scope.CreateEventAsync();
        using var reg = await scope.CreateRegistrationAsync(e.Entity, user.Entity);

        var client = factory.CreateClient().AuthenticatedAsSystemAdmin();
        var response = await client.PutAsync($"/v3/registrations/{reg.Entity.RegistrationId}", new
        {
            customer = new { payerType = "OwnCompany", name = "Nordmann Consulting" }
        });
        response.CheckBadRequest();
    }

    [Fact]
    public async Task Put_Should_Accept_Own_Company_Without_Invoice_Reference()
    {
        using var scope = factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var e = await scope.CreateEventAsync();
        using var reg = await scope.CreateRegistrationAsync(e.Entity, user.Entity);

        var client = factory.CreateClient().AuthenticatedAsSystemAdmin();
        var response = await client.PutAsync($"/v3/registrations/{reg.Entity.RegistrationId}", new
        {
            customer = new
            {
                payerType = "OwnCompany",
                name = "Nordmann Consulting",
                vatNumber = "123456785",
                email = "kari@example.com",
                contactName = "Kari Nordmann"
            }
        });
        response.CheckOk();
    }

    [Fact]
    public async Task Put_Should_Accept_Customer_Without_Payer_Type_As_Before()
    {
        using var scope = factory.Services.NewTestScope();
        using var user = await scope.CreateUserAsync();
        using var e = await scope.CreateEventAsync();
        using var reg = await scope.CreateRegistrationAsync(e.Entity, user.Entity);

        var client = factory.CreateClient().AuthenticatedAsSystemAdmin();
        var response = await client.PutAsync($"/v3/registrations/{reg.Entity.RegistrationId}", new
        {
            customer = new { name = "Kari Nordmann", vatNumber = "974760673" }
        });
        response.CheckOk();
    }
}
