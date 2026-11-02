using System;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Services.Invoicing;
using Eventuras.TestAbstractions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Invoices;

public class InvoiceInfoTests : IClassFixture<CustomWebApiApplicationFactory<Program>>
{
    private readonly CustomWebApiApplicationFactory<Program> _factory;

    public InvoiceInfoTests(CustomWebApiApplicationFactory<Program> factory) =>
        _factory = factory ?? throw new ArgumentNullException(nameof(factory));

    [Theory]
    [InlineData(3010, 3010)] // product has its own account -> carried through
    [InlineData(null, null)] // no account -> null, provider falls back to the org default
    public async Task CreateFromOrderList_Should_Carry_Product_SalesAccount(int? productSalesAccount, int? expected)
    {
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();
        using var user = await scope.CreateUserAsync();
        using var registration = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
        using var product = await scope.CreateProductAsync(evt.Entity);

        product.Entity.SalesAccount = productSalesAccount;
        await scope.Db.SaveChangesAsync();

        using var order = await scope.CreateOrderAsync(registration.Entity, product.Entity);

        // Load the same way the invoicing flow does (see OrdersQueryableExtensions):
        // order lines must include the live Product so its sales account is available.
        var orders = await scope.Db.Orders
            .Where(o => o.OrderId == order.Entity.OrderId)
            .Include(o => o.Registration).ThenInclude(r => r.User)
            .Include(o => o.Registration).ThenInclude(r => r.EventInfo)
            .Include(o => o.OrderLines).ThenInclude(l => l.Product)
            .AsNoTracking()
            .ToListAsync();

        var info = InvoiceInfo.CreateFromOrderList(orders);

        var productLine = info.Lines.Single(l => l.Type == InvoiceLineType.Product);
        Assert.Equal(expected, productLine.SalesAccount);
    }

    [Fact]
    public async Task CreateFromOrderList_Should_Bill_The_Organization_For_The_Participant()
    {
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();
        using var user = await scope.CreateUserAsync();
        using var registration = await scope.CreateRegistrationAsync(evt.Entity, user.Entity);
        using var product = await scope.CreateProductAsync(evt.Entity);

        registration.Entity.CustomerName = "Oslo kommune";
        registration.Entity.CustomerContactName = "Per Hansen";
        await scope.Db.SaveChangesAsync();

        using var order = await scope.CreateOrderAsync(registration.Entity, product.Entity);
        order.Entity.CopyPayerFrom(registration.Entity);
        await scope.Db.SaveChangesAsync();

        var orders = await scope.Db.Orders
            .Where(o => o.OrderId == order.Entity.OrderId)
            .Include(o => o.Registration).ThenInclude(r => r.User)
            .Include(o => o.Registration).ThenInclude(r => r.EventInfo)
            .Include(o => o.OrderLines).ThenInclude(l => l.Product)
            .AsNoTracking()
            .ToListAsync();

        var info = InvoiceInfo.CreateFromOrderList(orders);

        Assert.Equal("Oslo kommune", info.CustomerName);
        Assert.Equal("Per Hansen", info.CustomerContactName);
        var textLine = info.Lines.First(l => l.Type == InvoiceLineType.Text);
        Assert.StartsWith($"Deltakelse for {user.Entity.Name} på", textLine.Description);
    }
}
