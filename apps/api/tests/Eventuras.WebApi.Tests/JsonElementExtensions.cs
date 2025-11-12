using System;
using System.Linq;
using System.Text.Json;
using Eventuras.Domain;
using NodaTime;
using Xunit;

namespace Eventuras.WebApi.Tests;

public static class JsonElementExtensions
{
    // Helper methods for reading values from JsonElement
    public static T GetValue<T>(this JsonElement element, string propertyName)
    {
        if (!element.TryGetProperty(propertyName, out var property))
        {
            return default;
        }

        return typeof(T) switch
        {
            Type t when t == typeof(string) => (T)(object)property.GetString(),
            Type t when t == typeof(int) => (T)(object)property.GetInt32(),
            Type t when t == typeof(int?) => property.ValueKind == JsonValueKind.Null
                ? default
                : (T)(object)property.GetInt32(),
            Type t when t == typeof(bool) => (T)(object)property.GetBoolean(),
            Type t when t == typeof(decimal) => (T)(object)property.GetDecimal(),
            Type t when t == typeof(DateTime) => (T)(object)property.GetDateTime(),
            Type t when t == typeof(DateTime?) => property.ValueKind == JsonValueKind.Null
                ? default
                : (T)(object)property.GetDateTime(),
            Type t when t == typeof(LocalDate?) => property.ValueKind == JsonValueKind.Null
                ? default
                : (T)(object)LocalDate.FromDateTime(property.GetDateTime()),
            Type t when t == typeof(JsonElement) => (T)(object)property,
            _ => throw new NotSupportedException($"Type {typeof(T)} is not supported")
        };
    }

    public static void CheckUser(this JsonElement token, ApplicationUser user)
    {
        Assert.Equal(user.Id, token.GetValue<string>("id"));
        Assert.Equal(user.Name, token.GetValue<string>("name"));
        Assert.Equal(user.Email, token.GetValue<string>("email"));
        Assert.Equal(user.PhoneNumber, token.GetValue<string>("phoneNumber"));
    }

    public static void CheckRegistration(this JsonElement token, Registration registration,
        bool checkUserInfo = false,
        bool checkEventInfo = false)
    {
        Assert.Equal(registration.RegistrationId, token.GetValue<int>("registrationId"));
        Assert.Equal(registration.EventInfoId, token.GetValue<int>("eventId"));
        Assert.Equal(registration.UserId, token.GetValue<string>("userId"));
        Assert.Equal(registration.Status.ToString(), token.GetValue<string>("status"));
        Assert.Equal(registration.Type.ToString(), token.GetValue<string>("type"));
        Assert.Equal(registration.Notes, token.GetValue<string>("notes"));

        if (checkUserInfo)
        {
            token.GetValue<JsonElement>("user").CheckUser(registration.User);
        }

        if (checkEventInfo)
        {
            token.GetValue<JsonElement>("event").CheckEvent(registration.EventInfo);
        }
    }

    public static void CheckCertificate(this JsonElement token, Certificate certificate)
    {
        Assert.Equal(certificate.CertificateId, token.GetValue<int>("certificateId"));
        Assert.Equal(certificate.CertificateGuid.ToString(), token.GetValue<string>("certificateGuid"));
        Assert.Equal(certificate.Title, token.GetValue<string>("title"));
        Assert.Equal(certificate.Description, token.GetValue<string>("description"));
        Assert.Equal(certificate.Comment, token.GetValue<string>("comment"));
        Assert.Equal(certificate.RecipientName, token.GetValue<string>("recipientName"));
        Assert.Equal(certificate.EvidenceDescription, token.GetValue<string>("evidenceDescription"));
        Assert.Equal(certificate.IssuedInCity, token.GetValue<string>("issuedInCity"));
        Assert.Equal(certificate.IssuedDate.ToString("yyyy-MM-dd"), token.GetValue<string>("issuingDate"));
        Assert.Equal(certificate.IssuingOrganizationName, token.GetValue<string>("issuerOrganizationName"));
        Assert.Equal(certificate.IssuingOrganization?.LogoBase64,
            token.GetValue<string>("issuerOrganizationLogoBase64"));
        Assert.Equal(certificate.IssuedByName, token.GetValue<string>("issuerPersonName"));
        Assert.Equal(certificate.IssuingUser?.SignatureImageBase64,
            token.GetValue<string>("issuerPersonSignatureImageBase64"));
    }

    public static void CheckEvent(this JsonElement token, EventInfo eventInfo)
    {
        Assert.Equal(eventInfo.EventInfoId, token.GetValue<int>("id"));
        Assert.Equal(eventInfo.Type.ToString(), token.GetValue<string>("type"));
        Assert.Equal(eventInfo.Title, token.GetValue<string>("title"));
        Assert.Equal(eventInfo.Slug, token.GetValue<string>("slug"));
        Assert.Equal(eventInfo.Category, token.GetValue<string>("category"));
        Assert.Equal(eventInfo.Description, token.GetValue<string>("description"));
        Assert.Equal(eventInfo.Program, token.GetValue<string>("program"));
        Assert.Equal(eventInfo.PracticalInformation, token.GetValue<string>("practicalInformation"));
        Assert.Equal(eventInfo.OnDemand, token.GetValue<bool>("onDemand"));
        Assert.Equal(eventInfo.Featured, token.GetValue<bool>("featured"));
        Assert.Equal(eventInfo.DateStart?.ToString("yyyy-MM-dd"), token.GetValue<string>("dateStart"));
        Assert.Equal(eventInfo.DateEnd?.ToString("yyyy-MM-dd"), token.GetValue<string>("dateEnd"));
        Assert.Equal(eventInfo.LastRegistrationDate, token.GetValue<LocalDate?>("lastRegistrationDate"));
        Assert.Equal(eventInfo.Location, token.GetValue<string>("location"));
        Assert.Equal(eventInfo.City, token.GetValue<string>("city"));
    }

    public static void CheckEventCollection(this JsonElement token, EventCollection c)
    {
        if (c == null)
        {
            Assert.Equal(JsonValueKind.Null, token.ValueKind);
            return;
        }

        Assert.Equal(c.CollectionId, token.GetValue<int>("id"));
        Assert.Equal(c.Name, token.GetValue<string>("name"));
        Assert.Equal(c.Slug, token.GetValue<string>("slug"));
        Assert.Equal(c.Description, token.GetValue<string>("description"));
        Assert.Equal(c.Featured, token.GetValue<bool>("featured"));
        Assert.Equal(c.FeaturedImageUrl, token.GetValue<string>("featuredImageUrl"));
        Assert.Equal(c.FeaturedImageCaption, token.GetValue<string>("featuredImageCaption"));
    }

    public static JsonElement CheckOrder(this JsonElement token, Order order,
        bool checkUser = false,
        bool checkUserNull = false,
        bool checkRegistration = false,
        bool checkRegistrationNull = false,
        bool checkItems = false)
    {
        Assert.Equal(order.OrderId, token.GetValue<int>("orderId"));
        var statusStr = token.GetValue<string>("status");
        Assert.NotNull(statusStr);
        Assert.Equal(order.Status, Enum.Parse<Order.OrderStatus>(statusStr));
        Assert.Equal(order.OrderTime.ToDateTimeUtc(), token.ReadAsDateTimeOffset("time"));
        Assert.Equal(order.UserId, token.GetValue<string>("userId"));
        Assert.Equal(order.RegistrationId, token.GetValue<int>("registrationId"));

        var userToken = token.GetValue<JsonElement>("user");
        if (checkUser)
        {
            Assert.NotEqual(JsonValueKind.Null, userToken.ValueKind);
            Assert.NotEqual(JsonValueKind.Undefined, userToken.ValueKind);
            userToken.CheckUser(order.User);
        }
        else if (checkUserNull)
        {
            Assert.True(userToken.ValueKind == JsonValueKind.Null || userToken.ValueKind == JsonValueKind.Undefined);
        }

        var registrationToken = token.GetValue<JsonElement>("registration");
        if (checkRegistration)
        {
            Assert.NotEqual(JsonValueKind.Null, registrationToken.ValueKind);
            Assert.NotEqual(JsonValueKind.Undefined, registrationToken.ValueKind);
            registrationToken.CheckOrderRegistration(order.Registration);
        }
        else if (checkRegistrationNull)
        {
            Assert.True(registrationToken.ValueKind == JsonValueKind.Null || registrationToken.ValueKind == JsonValueKind.Undefined);
        }

        if (checkItems)
        {
            var itemsToken = token.GetValue<JsonElement>("items");
            Assert.NotEqual(JsonValueKind.Null, itemsToken.ValueKind);
            itemsToken
                .CheckArray((t, item) => t.CheckOrderItem(item),
                    order.OrderLines?.ToArray() ?? Array.Empty<OrderLine>());
        }

        return token;
    }

    public static void CheckOrderRegistration(this JsonElement token, Registration registration)
    {
        Assert.Equal(registration.RegistrationId, token.GetValue<int>("registrationId"));
        Assert.Equal(registration.EventInfoId, token.GetValue<int>("eventId"));
        Assert.Equal(registration.UserId, token.GetValue<string>("userId"));
        Assert.Equal(registration.Status.ToString(), token.GetValue<string>("status"));
        Assert.Equal(registration.Type.ToString(), token.GetValue<string>("type"));
        Assert.Equal(registration.Notes, token.GetValue<string>("notes"));
    }

    public static void CheckOrderItem(this JsonElement token, OrderLine item)
    {
        if (item.ProductId.HasValue)
        {
            token.GetValue<JsonElement>("product").CheckProduct(item.Product);
        }

        if (item.ProductVariantId.HasValue)
        {
            token.GetValue<JsonElement>("productVariant").CheckProductVariant(item.ProductVariant);
        }

        Assert.Equal(item.Quantity, token.GetValue<int>("quantity"));
    }

    public static void CheckRegistrationOrder(this JsonElement token, Order order)
    {
        Assert.Equal(order.OrderId, token.GetValue<int>("orderId"));
        token.GetValue<JsonElement>("items")
            .CheckArray((t, item) => t.CheckOrderItem(item),
                order.OrderLines?.ToArray() ?? Array.Empty<OrderLine>());
    }

    public static void CheckRegistrationOrderItem(this JsonElement token, OrderLine item)
    {
        if (item.ProductId.HasValue)
        {
            token.GetValue<JsonElement>("product").CheckProduct(item.Product);
        }

        if (item.ProductVariantId.HasValue)
        {
            token.GetValue<JsonElement>("productVariant").CheckProductVariant(item.ProductVariant);
        }

        Assert.Equal(item.Quantity, token.GetValue<int>("quantity"));
    }

    public static void CheckProduct(this JsonElement token, Product product, params ProductVariant[] variants)
    {
        Assert.Equal(product.ProductId, token.GetValue<int>("productId"));
        Assert.Equal(product.Name, token.GetValue<string>("name"));
        Assert.Equal(product.Description, token.GetValue<string>("description"));
        Assert.Equal(product.Price, token.GetValue<decimal>("price"));
        Assert.Equal(product.VatPercent, token.GetValue<int>("vatPercent"));
        Assert.Equal(product.Visibility.ToString(), token.GetValue<string>("visibility"));

        if (variants.Any())
        {
            token.GetValue<JsonElement>("variants")
                .CheckArray((t, v) => t
                    .CheckProductVariant(v), variants);
        }
    }

    public static void CheckProductVariant(this JsonElement token, ProductVariant productVariant)
    {
        Assert.Equal(productVariant.ProductVariantId, token.GetValue<int>("productVariantId"));
        Assert.Equal(productVariant.Name, token.GetValue<string>("name"));
        Assert.Equal(productVariant.Description, token.GetValue<string>("description"));
        Assert.Equal(productVariant.Price, token.GetValue<decimal>("price"));
        Assert.Equal(productVariant.VatPercent, token.GetValue<int>("vatPercent"));
    }

    public static void CheckOrganization(this JsonElement token, Organization organization)
    {
        Assert.Equal(organization.OrganizationId, token.GetValue<int>("organizationId"));
        Assert.Equal(organization.Name, token.GetValue<string>("name"));
        Assert.Equal(organization.Description, token.GetValue<string>("description"));
        Assert.Equal(organization.Url, token.GetValue<string>("url"));
        Assert.Equal(organization.Phone, token.GetValue<string>("phone"));
        Assert.Equal(organization.Email, token.GetValue<string>("email"));
        Assert.Equal(organization.LogoUrl, token.GetValue<string>("logoUrl"));
        Assert.Equal(organization.LogoBase64, token.GetValue<string>("logoBase64"));
    }

    public static void CheckNotification(this JsonElement token,
        Notification notification,
        int? totalRecipients = null)
    {
        Assert.NotEqual(JsonValueKind.Null, token.ValueKind);
        Assert.Equal(notification.NotificationId, token.GetValue<int>("notificationId"));
        Assert.Equal(notification.OrganizationId, token.GetValue<int?>("organizationId"));
        Assert.Equal(notification.EventInfoId, token.GetValue<int?>("eventId"));
        Assert.Equal(notification.ProductId, token.GetValue<int?>("productId"));
        Assert.Equal(notification.Created.ToString("yyyy-MM-ddTHH:mm:ss"),
            token.GetValue<DateTime>("created").ToString("yyyy-MM-ddTHH:mm:ss"));
        Assert.Equal(notification.StatusUpdated.ToString("yyyy-MM-ddTHH:mm:ss"),
            token.GetValue<DateTime>("statusUpdated").ToString("yyyy-MM-ddTHH:mm:ss"));
        Assert.Equal(notification.Type.ToString(), token.GetValue<string>("type"));
        Assert.Equal(notification.Status.ToString(), token.GetValue<string>("status"));
    }

    public static void CheckNotificationRecipient(this JsonElement token, NotificationRecipient recipient)
    {
        Assert.NotEqual(JsonValueKind.Null, token.ValueKind);
        Assert.Equal(recipient.RecipientId, token.GetValue<int>("recipientId"));
        Assert.Equal(recipient.NotificationId, token.GetValue<int>("notificationId"));
        Assert.Equal(recipient.RecipientUserId, token.GetValue<string>("recipientUserId"));
        Assert.Equal(recipient.RegistrationId, token.GetValue<int?>("registrationId"));
        Assert.Equal(recipient.RecipientName, token.GetValue<string>("recipientName"));
        Assert.Equal(recipient.RecipientIdentifier, token.GetValue<string>("recipientIdentifier"));
        Assert.Equal(recipient.Created.ToString("yyyy-MM-ddTHH:mm:ss"),
            token.GetValue<DateTime>("created").ToString("yyyy-MM-ddTHH:mm:ss"));
        Assert.Equal(recipient.Sent?.ToString("yyyy-MM-ddTHH:mm:ss"),
            token.GetValue<DateTime?>("sent")?.ToString("yyyy-MM-ddTHH:mm:ss"));
        Assert.Equal(recipient.Errors, token.GetValue<string>("errors"));
    }

    public static void CheckStringArray(this JsonElement array, params string[] roles)
    {
        array.CheckArray((t, r) => Assert.Equal(r, t.GetString()), roles);
    }

    public static JsonElement CheckArray<T>(this JsonElement token, Action<JsonElement, T> f, params T[] values)
    {
        Assert.Equal(JsonValueKind.Array, token.ValueKind);
        var count = token.GetArrayLength();
        Assert.Equal(values.Length, count);
        var i = 0;
        foreach (var element in token.EnumerateArray())
        {
            f(element, values[i]);
            i++;
        }

        return token;
    }

    public static JsonElement CheckEmptyArray(this JsonElement token)
    {
        Assert.Equal(JsonValueKind.Array, token.ValueKind);
        Assert.Equal(0, token.GetArrayLength());
        return token;
    }

    public static JsonElement CheckEmptyPaging(this JsonElement token)
    {
        Assert.Equal(1, token.GetValue<int>("page"));
        Assert.Equal(0, token.GetValue<int>("total"));
        Assert.Equal(0, token.GetValue<int>("pages"));
        token.GetValue<JsonElement>("data").CheckEmptyArray();
        return token;
    }

    public static JsonElement CheckPaging<T>(this JsonElement token, Action<JsonElement, T> f,
        params T[] data)
    {
        return CheckPaging(token, 1, null, null, f, data);
    }

    public static JsonElement CheckPaging<T>(this JsonElement token, int page, int? total, Action<JsonElement, T> f,
        params T[] data)
    {
        return CheckPaging(token, page, null, total, f, data);
    }

    public static JsonElement CheckPaging<T>(this JsonElement token, int page, int? count, int? total, Action<JsonElement, T> f,
        params T[] data)
    {
        Assert.Equal(page, token.GetValue<int>("page"));
        if (count.HasValue)
        {
            Assert.Equal(count.Value, token.GetValue<int>("count"));
        }

        if (total.HasValue)
        {
            Assert.Equal(total.Value, token.GetValue<int>("total"));
        }

        var arr = token.GetValue<JsonElement>("data");
        arr.CheckArray(f, data);
        return token;
    }

    private static DateTimeOffset? ReadAsDateTimeOffset(this JsonElement t, string path)
    {
        if (!t.TryGetProperty(path, out var property))
        {
            return null;
        }

        if (property.ValueKind == JsonValueKind.Null)
        {
            return null;
        }

        return property.GetDateTimeOffset();
    }
}
