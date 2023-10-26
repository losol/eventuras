﻿#nullable enable

using Eventuras.Domain;
using Eventuras.WebApi.Controllers.Events;
using Eventuras.WebApi.Controllers.Events.Products;
using Eventuras.WebApi.Controllers.Orders;
using Eventuras.WebApi.Controllers.Registrations;
using Eventuras.WebApi.Controllers.Users;
using System;
using System.Collections.Generic;
using System.Linq;
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
        if (expected is not null) Assert.NotNull(actual);
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

        if (checkUserInfo) CheckUserInfo(expected.User, actual.User);
        if (checkEventInfo) CheckEventInfo(expected.EventInfo, actual.Event);
        if (checkAutoCreatedOrder) CheckOrders(expected.Orders, actual.Orders?.ToArray());
        if (checkProducts) CheckProducts(expected.Products, actual.Products);
    }

    private static void CheckProducts(ICollection<OrderDTO>? expected, IEnumerable<ProductOrderDto>? actual)
    {
        if (expected is not null) Assert.NotNull(actual);
        else
        {
            Assert.Null(actual);
            return;
        }

        var expectedMappedAndOrdered = expected
            .Select(ProductOrderDto.FromRegistrationOrderDto)
            .OrderBy(ol => new { ol.ProductId, ol.ProductVariantId });
        var actualOrdered = actual.OrderBy(ol => new { ol.ProductId, ol.ProductVariantId });

        // Uses ProductOrderDto.Equal method
        Assert.Equal(expectedMappedAndOrdered, actualOrdered);
    }

    public static void CheckOrders(ICollection<Order>? expected, ICollection<OrderDto>? actual)
    {
        if (expected is not null) Assert.NotNull(actual);
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
        if (expected is not null) Assert.NotNull(actual);
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

        if (checkUserInfo) CheckUserInfo(expected.User, actual.User);
        if (checkItems) CheckOrderItems(expected.OrderLines, actual.Items);

        // we need mapper with enabled reference handling (automapper / mapperly / mapster) + remove duplicated dtos:
        // if (checkRegistration) CheckRegistration(expected.Registration, actual.Registration);
        if (checkRegistration) throw new NotImplementedException();
    }

    private static void CheckOrderItems(ICollection<OrderLine>? expected, IEnumerable<OrderLineDto>? actual)
    {
        if (expected is not null) Assert.NotNull(actual);
        else
        {
            Assert.Null(actual);
            return;
        }

        var expectedMappedAndOrdered = expected
            .Select(ol => new OrderLineDto(ol))
            .OrderBy(ol => new { ol.Product.ProductId, ol.ProductVariant?.ProductVariantId });
        var actualOrdered = actual.OrderBy(ol => new { ol.Product.ProductId, ol.ProductVariant?.ProductVariantId });

        // Uses OrderLineDto.Equal method
        Assert.Equal(expectedMappedAndOrdered, actualOrdered);
    }

    public static void CheckEventInfo(EventInfo? expected, EventDto? actual)
    {
        if (expected is not null) Assert.NotNull(actual);
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
        if (expected is not null) Assert.NotNull(actual);
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