#nullable enable

using System;
using System.Collections.Generic;
using System.Linq;
using Eventuras.Domain;
using Eventuras.WebApi.Controllers.v3.Events;
using Eventuras.WebApi.Controllers.v3.Events.Products;
using Eventuras.WebApi.Controllers.v3.Orders;
using Eventuras.WebApi.Controllers.v3.Registrations;
using Eventuras.WebApi.Controllers.v3.Users;
using Xunit;

namespace Eventuras.WebApi.Tests;

public static class ModelValidations
{
    public static void CheckRegistration(
        Registration? expected,
        RegistrationDto? actual,
        bool checkUserInfo = false,
        bool checkEventInfo = false,
        bool checkAutoCreatedOrder = false,
        bool checkProducts = false)
    {
        if (expected is not null)
            Assert.NotNull(actual);
        else
        {
            Assert.Null(actual);
            return;
        }

        Assert.Equal(expected.RegistrationId, actual.RegistrationId);
        Assert.Equal(expected.EventInfoId, actual.EventId);
        Assert.Equal(expected.UserId, actual.UserId);
        Assert.Equal(expected.Status, actual.Status);
        Assert.Equal(expected.Type, actual.Type);
        Assert.Equal(expected.Notes, actual.Notes);

        if (checkUserInfo)
            CheckUserInfo(expected.User, actual.User);
        if (checkEventInfo)
            CheckEventInfo(expected.EventInfo, actual.Event);
        if (checkAutoCreatedOrder)
            CheckOrders(expected.Orders, actual.Orders?.ToArray());
        if (checkProducts)
            CheckProducts(actual.Products);
    }

    private static void CheckProducts(IEnumerable<ProductOrderDto>? actual)
    {
        // Since products are fetched via service layer, we can only validate
        // that the DTO structure is correct, not compare with domain model directly
        if (actual != null)
        {
            foreach (var product in actual)
            {
                Assert.True(product.ProductId > 0, "ProductId should be positive");
                Assert.NotNull(product.Product);
                Assert.True(product.Quantity != 0, "Quantity should not be zero");
            }
        }
    }

    public static void CheckOrders(ICollection<Order>? expected, ICollection<OrderDto>? actual)
    {
        if (expected is not null)
            Assert.NotNull(actual);
        else
        {
            Assert.Null(actual);
            return;
        }

        Assert.Equal(expected.Count, actual.Count);

        var expectedOrdered = expected.OrderBy(o => o.OrderId);
        var actualOrdered = actual.OrderBy(o => o.OrderId).ToArray();

        Assert.All(expectedOrdered,
            (exp, i) =>
            {
                var act = actualOrdered[i];
                CheckOrder(exp, act);
            });
    }

    public static void CheckOrder(Order? expected, OrderDto? actual, bool checkUserInfo = false, bool checkRegistration = false, bool checkItems = false)
    {
        if (expected is not null)
            Assert.NotNull(actual);
        else
        {
            Assert.Null(actual);
            return;
        }

        Assert.Equal(expected.OrderId, actual.OrderId);
        Assert.Equal(expected.Status, actual.Status);
        Assert.Equal(expected.OrderTime.ToDateTimeOffset(), actual.Time);
        Assert.Equal(expected.UserId, actual.UserId);
        Assert.Equal(expected.RegistrationId, actual.RegistrationId);

        if (checkUserInfo)
            CheckUserInfo(expected.User, actual.User);
        if (checkItems)
            CheckOrderItems(expected.OrderLines, actual.Items);

        // we need mapper with enabled reference handling (automapper / mapperly / mapster) + remove duplicated dtos:
        // if (checkRegistration) CheckRegistration(expected.Registration, actual.Registration);
        if (checkRegistration)
            throw new NotImplementedException();
    }

    private static void CheckOrderItems(ICollection<OrderLine>? expected, IEnumerable<OrderLineDto>? actual)
    {
        if (expected is not null)
            Assert.NotNull(actual);
        else
        {
            Assert.Null(actual);
            return;
        }

        var actualList = actual.ToList();
        Assert.Equal(expected.Count, actualList.Count);

        var expectedOrdered = expected.OrderBy(ol => new { ol.ProductId, ol.ProductVariantId }).ToList();
        var actualOrdered = actualList.OrderBy(ol => new { ol.Product.ProductId, ol.ProductVariant?.ProductVariantId }).ToList();

        for (int i = 0; i < expectedOrdered.Count; i++)
        {
            var exp = expectedOrdered[i];
            var act = actualOrdered[i];

            Assert.Equal(exp.ProductId, act.Product.ProductId);
            Assert.Equal(exp.ProductVariantId, act.ProductVariant?.ProductVariantId);
            Assert.Equal(exp.Quantity, act.Quantity);
        }
    }

    public static void CheckEventInfo(EventInfo? expected, EventDto? actual)
    {
        if (expected is not null)
            Assert.NotNull(actual);
        else
        {
            Assert.Null(actual);
            return;
        }

        Assert.Equal(expected.EventInfoId, actual.Id);
        Assert.Equal(expected.Type, actual.Type);
        Assert.Equal(expected.Title, actual.Title);
        Assert.Equal(expected.Slug, actual.Slug);
        Assert.Equal(expected.Category, actual.Category);
        Assert.Equal(expected.Description, actual.Description);
        Assert.Equal(expected.Program, actual.Program);
        Assert.Equal(expected.PracticalInformation, actual.PracticalInformation);
        Assert.Equal(expected.OnDemand, actual.OnDemand);
        Assert.Equal(expected.Featured, actual.Featured);
        Assert.Equal(expected.DateStart?.ToDateOnly(), actual.DateStart?.ToDateOnly());
        Assert.Equal(expected.DateEnd?.ToDateOnly(), actual.DateEnd?.ToDateOnly());
        Assert.Equal(expected.LastRegistrationDate?.ToDateOnly(), actual.LastRegistrationDate?.ToDateOnly());
        Assert.Equal(expected.Location, actual.Location);
        Assert.Equal(expected.City, actual.City);
    }

    public static void CheckUserInfo(ApplicationUser? expected, UserDto? actual)
    {
        if (expected is not null)
            Assert.NotNull(actual);
        else
        {
            Assert.Null(actual);
            return;
        }

        Assert.Equal(expected.Id, actual.Id);
        Assert.Equal(expected.Name, actual.Name);
        Assert.Equal(expected.Email, actual.Email);
        Assert.Equal(expected.PhoneNumber, actual.PhoneNumber);
    }
}
