using System;
using System.Threading.Tasks;
using Eventuras.Services;
using Eventuras.TestAbstractions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Events.Products;

public class EventProductVariantsControllerTests : IClassFixture<CustomWebApiApplicationFactory<Program>>
{
    private readonly CustomWebApiApplicationFactory<Program> _factory;

    public EventProductVariantsControllerTests(CustomWebApiApplicationFactory<Program> factory) =>
        _factory = factory ?? throw new ArgumentNullException(nameof(factory));

    #region List

    [Fact]
    public async Task Should_Not_Require_Auth_To_List_Product_Variants()
    {
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();
        using var product = await scope.CreateProductAsync(evt.Entity);

        var client = _factory.CreateClient();
        var response =
            await client.GetAsync(
                $"/v3/events/{evt.Entity.EventInfoId}/products/{product.Entity.ProductId}/variants");
        response.CheckOk();

        var token = await response.AsArrayAsync();
        token.CheckEmptyArray();
    }

    [Fact]
    public async Task Should_Return_Not_Found_When_Listing_Variants_For_Unknown_Event()
    {
        var client = _factory.CreateClient();
        var response =
            await client.GetAsync(
                "/v3/events/123/products/4456/variants");
        response.CheckNotFound();
    }

    [Fact]
    public async Task Should_Return_Not_Found_When_Listing_Variants_For_Unknown_Product()
    {
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();

        var client = _factory.CreateClient();
        var response =
            await client.GetAsync(
                $"/v3/events/{evt.Entity.EventInfoId}/products/4456/variants");
        response.CheckNotFound();
    }

    [Fact]
    public async Task List_Should_Not_Return_Archived_Variants()
    {
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();
        using var product = await scope.CreateProductAsync(evt.Entity);
        using var v1 = await scope.CreateProductVariantAsync(product.Entity, "v1", archived: true);
        using var v2 = await scope.CreateProductVariantAsync(product.Entity, "v2");

        var client = _factory.CreateClient();

        var response =
            await client.GetAsync(
                $"/v3/events/{evt.Entity.EventInfoId}/products/{product.Entity.ProductId}/variants");
        response.CheckOk();

        var token = await response.AsArrayAsync();
        token.CheckArray((t, v) => t.CheckProductVariant(v),
            v2.Entity);
    }

    [Theory]
    [InlineData(null)]
    [InlineData(Roles.Admin)]
    [InlineData(Roles.SuperAdmin)]
    [InlineData(Roles.SystemAdmin)]
    public async Task Should_Allow_Authenticated_User_To_List_Product_Variants(string role)
    {
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();
        using var product = await scope.CreateProductAsync(evt.Entity);
        using var v1 = await scope.CreateProductVariantAsync(product.Entity, "v1");
        using var v2 = await scope.CreateProductVariantAsync(product.Entity, "v2");

        var client = _factory.CreateClient()
            .Authenticated(role: role);

        var response =
            await client.GetAsync(
                $"/v3/events/{evt.Entity.EventInfoId}/products/{product.Entity.ProductId}/variants");
        response.CheckOk();

        var token = await response.AsArrayAsync();
        token.CheckArray((t, v) => t.CheckProductVariant(v),
            v1.Entity, v2.Entity);
    }

    #endregion

    #region Add

    [Fact]
    public async Task Add_Should_Require_Auth()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsync("/v3/events/33/products/32/variants");
        response.CheckUnauthorized();
    }

    [Fact]
    public async Task Add_Should_Require_Admin_Role()
    {
        var client = _factory.CreateClient().Authenticated();
        var response = await client.PostAsync("/v3/events/33/products/32/variants");
        response.CheckForbidden();
    }


    [Theory]
    [MemberData(nameof(GetInvalidAddFormInput))]
    public async Task Add_Should_Validate_Body(object body)
    {
        var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
        var response = await client.PostAsync("/v3/events/33/products/32/variants", body);
        response.CheckBadRequest();
    }

    public static object[][] GetInvalidAddFormInput() =>
        new[]
        {
            new object[] { new { price = -1 } }, // price=0 is OK
            new object[] { new { vatPercent = -1 } } // vatPercent=0 is OK
        };

    [Fact]
    public async Task Add_Should_Return_NotFound_For_Non_Existing_Event()
    {
        var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
        var response = await client.PostAsync("/v3/events/33/products/32/variants");
        response.CheckNotFound();
    }

    [Fact]
    public async Task Add_Should_Return_NotFound_For_Non_Existing_Product()
    {
        var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();
        var response = await client.PostAsync($"/v3/events/{evt.Entity.EventInfoId}/products/32/variants");
        response.CheckNotFound();
    }

    [Fact]
    public async Task Add_Should_Check_Admin_Org()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org1 = await scope.CreateOrganizationAsync();
        using var org2 = await scope.CreateOrganizationAsync();
        using var admin = await scope.CreateUserAsync();
        using var m = await scope.CreateOrganizationMemberAsync(admin.Entity, org2.Entity, role: Roles.Admin);
        using var evt = await scope.CreateEventAsync(organization: org1.Entity);
        using var p = await scope.CreateProductAsync(evt.Entity);

        var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);

        var response =
            await client.PostAsync(
                $"/v3/events/{evt.Entity.EventInfoId}/products/{p.Entity.ProductId}/variants?orgId={org1.Entity.OrganizationId}",
                new { name = "test" });
        response.CheckForbidden();
    }

    [Fact]
    public async Task Add_Should_Check_Event_Org()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org1 = await scope.CreateOrganizationAsync();
        using var org2 = await scope.CreateOrganizationAsync();
        using var admin = await scope.CreateUserAsync();
        using var m = await scope.CreateOrganizationMemberAsync(admin.Entity, org1.Entity, role: Roles.Admin);
        using var evt = await scope.CreateEventAsync(organization: org2.Entity);
        using var p = await scope.CreateProductAsync(evt.Entity);

        var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);

        var response =
            await client.PostAsync(
                $"/v3/events/{evt.Entity.EventInfoId}/products/{p.Entity.ProductId}/variants?orgId={org1.Entity.OrganizationId}",
                new { name = "test" });
        response.CheckForbidden();
    }

    [Fact]
    public async Task Add_Should_Be_Available_For_Org_Admin()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var admin = await scope.CreateUserAsync();
        using var m = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
        using var evt = await scope.CreateEventAsync(organization: org.Entity);
        using var product = await scope.CreateProductAsync(evt.Entity);

        var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);

        var response = await client.PostAsync(
            $"/v3/events/{evt.Entity.EventInfoId}/products/{product.Entity.ProductId}/variants?orgId={org.Entity.OrganizationId}",
            new { name = "test" });
        response.CheckOk();

        var variant = await scope.Db.ProductVariants
            .SingleOrDefaultAsync(p => p.ProductId == product.Entity.ProductId);

        Assert.NotNull(variant);
        Assert.Equal("test", variant.Name);

        var token = await response.AsTokenAsync();
        token.CheckProductVariant(variant);
    }

    [Theory]
    [InlineData(Roles.SuperAdmin)]
    [InlineData(Roles.SystemAdmin)]
    public async Task Add_Should_Be_Available_For_Power_Users(string role)
    {
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();
        using var product = await scope.CreateProductAsync(evt.Entity);

        var client = _factory.CreateClient().Authenticated(role: role);

        var response = await client.PostAsync(
            $"/v3/events/{evt.Entity.EventInfoId}/products/{product.Entity.ProductId}/variants", new { name = "test" });
        response.CheckOk();

        var variant = await scope.Db.ProductVariants
            .SingleOrDefaultAsync(p => p.ProductId == product.Entity.ProductId);

        Assert.NotNull(variant);
        Assert.Equal("test", variant.Name);

        var token = await response.AsTokenAsync();
        token.CheckProductVariant(variant);
    }

    [Fact]
    public async Task Add_Should_Save_All_Data()
    {
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();
        using var product = await scope.CreateProductAsync(evt.Entity);

        var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();

        var response = await client.PostAsync(
            $"/v3/events/{evt.Entity.EventInfoId}/products/{product.Entity.ProductId}/variants",
            new { name = "test", description = "desc", price = 999.99, vatPercent = 8 });
        response.CheckOk();

        var variant = await scope.Db.ProductVariants
            .SingleOrDefaultAsync(p => p.ProductId == product.Entity.ProductId);

        Assert.NotNull(variant);
        Assert.Equal("test", variant.Name);
        Assert.Equal("desc", variant.Description);
        Assert.Equal((decimal)999.99, variant.Price);
        Assert.Equal(8, variant.VatPercent);

        var token = await response.AsTokenAsync();
        token.CheckProductVariant(variant);
    }

    #endregion

    #region Archive

    [Fact]
    public async Task Archive_Should_Require_Auth()
    {
        var client = _factory.CreateClient();
        var response = await client.DeleteAsync("/v3/events/1/products/2/variants/3");
        response.CheckUnauthorized();
    }

    [Fact]
    public async Task Archive_Should_Require_Admin_Role()
    {
        var client = _factory.CreateClient().Authenticated();
        var response = await client.DeleteAsync("/v3/events/1/products/2/variants/3");
        response.CheckForbidden();
    }

    [Fact]
    public async Task Archive_Should_Return_NotFound_For_Non_Existing_Event()
    {
        var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
        var response = await client.DeleteAsync("/v3/events/1001/products/2/variants/3");
        response.CheckNotFound();
    }

    [Fact]
    public async Task Archive_Should_Return_NotFound_For_Non_Existing_Product()
    {
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();

        var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
        var response = await client.DeleteAsync($"/v3/events/{evt.Entity.EventInfoId}/products/2/variants/3");
        response.CheckNotFound();
    }

    [Fact]
    public async Task Archive_Should_Return_NotFound_For_Non_Existing_Variant()
    {
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();
        using var p = await scope.CreateProductAsync(evt.Entity);

        var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();
        var response =
            await client.DeleteAsync(
                $"/v3/events/{evt.Entity.EventInfoId}/products/{p.Entity.ProductId}/variants/3");
        response.CheckNotFound();
    }

    [Fact]
    public async Task Archive_Should_Check_Admin_Org()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org1 = await scope.CreateOrganizationAsync();
        using var org2 = await scope.CreateOrganizationAsync();
        using var admin = await scope.CreateUserAsync();
        using var m = await scope.CreateOrganizationMemberAsync(admin.Entity, org2.Entity, role: Roles.Admin);
        using var evt = await scope.CreateEventAsync(organization: org1.Entity);
        using var p = await scope.CreateProductAsync(evt.Entity);
        using var v = await scope.CreateProductVariantAsync(p.Entity);

        var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);

        var response =
            await client.DeleteAsync(
                $"/v3/events/{evt.Entity.EventInfoId}/products/{p.Entity.ProductId}/variants/{v.Entity.ProductVariantId}?orgId={org1.Entity.OrganizationId}");
        response.CheckForbidden();
    }

    [Fact]
    public async Task Archive_Should_Check_Event_Org()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org1 = await scope.CreateOrganizationAsync();
        using var org2 = await scope.CreateOrganizationAsync();
        using var admin = await scope.CreateUserAsync();
        using var m = await scope.CreateOrganizationMemberAsync(admin.Entity, org1.Entity, role: Roles.Admin);
        using var evt = await scope.CreateEventAsync(organization: org2.Entity);
        using var p = await scope.CreateProductAsync(evt.Entity);
        using var v = await scope.CreateProductVariantAsync(p.Entity);

        var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);

        var response =
            await client.DeleteAsync(
                $"/v3/events/{evt.Entity.EventInfoId}/products/{p.Entity.ProductId}/variants/{v.Entity.ProductVariantId}?orgId={org1.Entity.OrganizationId}");
        response.CheckForbidden();
    }

    [Fact]
    public async Task Archive_Should_Be_Available_For_Org_Admin()
    {
        using var scope = _factory.Services.NewTestScope();
        using var org = await scope.CreateOrganizationAsync();
        using var admin = await scope.CreateUserAsync();
        using var m = await scope.CreateOrganizationMemberAsync(admin.Entity, org.Entity, role: Roles.Admin);
        using var evt = await scope.CreateEventAsync(organization: org.Entity);
        using var product = await scope.CreateProductAsync(evt.Entity);
        using var variant = await scope.CreateProductVariantAsync(product.Entity);
        Assert.False(variant.Entity.Archived);

        var client = _factory.CreateClient().AuthenticatedAs(admin.Entity, Roles.Admin);

        var response = await client.DeleteAsync(
            $"/v3/events/{evt.Entity.EventInfoId}/products/{product.Entity.ProductId}/variants/{variant.Entity.ProductVariantId}?orgId={org.Entity.OrganizationId}");
        response.CheckOk();

        var updatedVariant = await scope.Db.ProductVariants
            .AsNoTracking()
            .SingleOrDefaultAsync(v => v.ProductVariantId == variant.Entity.ProductVariantId);

        Assert.NotNull(updatedVariant);
        Assert.True(updatedVariant.Archived);
    }

    [Fact]
    public async Task Archive_Should_Return_Ok_For_Already_Archived_Variant()
    {
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();
        using var p = await scope.CreateProductAsync(evt.Entity);
        using var v = await scope.CreateProductVariantAsync(p.Entity, archived: true);

        var client = _factory.CreateClient().AuthenticatedAsSystemAdmin();

        var response =
            await client.DeleteAsync(
                $"/v3/events/{evt.Entity.EventInfoId}/products/{p.Entity.ProductId}/variants/{v.Entity.ProductVariantId}");
        response.CheckOk();
    }

    [Theory]
    [InlineData(Roles.SuperAdmin)]
    [InlineData(Roles.SystemAdmin)]
    public async Task Archive_Should_Be_Available_For_Power_Admin(string role)
    {
        using var scope = _factory.Services.NewTestScope();
        using var evt = await scope.CreateEventAsync();
        using var p = await scope.CreateProductAsync(evt.Entity);
        using var variant = await scope.CreateProductVariantAsync(p.Entity);
        Assert.False(variant.Entity.Archived);

        var client = _factory.CreateClient().Authenticated(role: role);

        var response =
            await client.DeleteAsync(
                $"/v3/events/{evt.Entity.EventInfoId}/products/{p.Entity.ProductId}/variants/{variant.Entity.ProductVariantId}");
        response.CheckOk();

        var updatedVariant = await scope.Db.ProductVariants
            .AsNoTracking()
            .SingleOrDefaultAsync(v => v.ProductVariantId == variant.Entity.ProductVariantId);

        Assert.NotNull(updatedVariant);
        Assert.True(updatedVariant.Archived);
    }

    #endregion
}
