using System;
using System.Linq;
using Eventuras.Domain;
using Newtonsoft.Json.Linq;
using Xunit;

namespace Eventuras.WebApi.Tests
{
    public static class JTokenExtensions
    {
        public static void CheckUser(this JToken token, ApplicationUser user)
        {
            Assert.Equal(user.Id, token.Value<string>("id"));
            Assert.Equal(user.Name, token.Value<string>("name"));
            Assert.Equal(user.Email, token.Value<string>("email"));
            Assert.Equal(user.PhoneNumber, token.Value<string>("phoneNumber"));
        }

        public static void CheckRegistration(this JToken token, Registration registration,
            bool checkUserInfo = false,
            bool checkEventInfo = false)
        {
            Assert.Equal(registration.RegistrationId, token.Value<int>("registrationId"));
            Assert.Equal(registration.EventInfoId, token.Value<int>("eventId"));
            Assert.Equal(registration.UserId, token.Value<string>("userId"));
            Assert.Equal(registration.Status.ToString(), token.Value<string>("status"));
            Assert.Equal(registration.Type.ToString(), token.Value<string>("type"));
            Assert.Equal(registration.Notes, token.Value<string>("notes"));

            if (checkUserInfo)
            {
                token.Value<JToken>("user").CheckUser(registration.User);
            }

            if (checkEventInfo)
            {
                token.Value<JToken>("event").CheckEvent(registration.EventInfo);
            }
        }

        public static void CheckEvent(this JToken token, EventInfo eventInfo)
        {
            Assert.Equal(eventInfo.EventInfoId, token.Value<int>("id"));
            Assert.Equal(eventInfo.Type.ToString(), token.Value<string>("type"));
            Assert.Equal(eventInfo.Title, token.Value<string>("title"));
            Assert.Equal(eventInfo.Slug, token.Value<string>("slug"));
            Assert.Equal(eventInfo.Category, token.Value<string>("category"));
            Assert.Equal(eventInfo.Description, token.Value<string>("description"));
            Assert.Equal(eventInfo.Program, token.Value<string>("program"));
            Assert.Equal(eventInfo.PracticalInformation, token.Value<string>("practicalInformation"));
            Assert.Equal(eventInfo.OnDemand, token.Value<bool>("onDemand"));
            Assert.Equal(eventInfo.Featured, token.Value<bool>("featured"));
            Assert.Equal(eventInfo.DateStart, token.Value<DateTime?>("dateStart"));
            Assert.Equal(eventInfo.DateEnd, token.Value<DateTime?>("dateEnd"));
            Assert.Equal(eventInfo.LastRegistrationDate, token.Value<DateTime?>("lastRegistrationDate"));
            Assert.Equal(eventInfo.Location, token.Value<string>("location"));
            Assert.Equal(eventInfo.City, token.Value<string>("city"));
        }

        public static void CheckEventCollection(this JToken token, EventCollection c)
        {
            if (c == null)
            {
                Assert.Empty(token);
                return;
            }

            Assert.Equal(c.CollectionId, token.Value<int>("id"));
            Assert.Equal(c.Name, token.Value<string>("name"));
            Assert.Equal(c.Slug, token.Value<string>("slug"));
            Assert.Equal(c.Description, token.Value<string>("description"));
            Assert.Equal(c.Featured, token.Value<bool>("featured"));
            Assert.Equal(c.FeaturedImageUrl, token.Value<string>("featuredImageUrl"));
            Assert.Equal(c.FeaturedImageCaption, token.Value<string>("featuredImageCaption"));
        }

        public static JToken CheckOrder(this JToken token, Order order,
            bool checkUser = false,
            bool checkUserNull = false,
            bool checkRegistration = false,
            bool checkRegistrationNull = false,
            bool checkItems = false)
        {
            Assert.Equal(order.OrderId, token.Value<int>("orderId"));
            var statusStr = token.Value<string>("status");
            Assert.NotNull(statusStr);
            Assert.Equal(order.Status, Enum.Parse<Order.OrderStatus>(statusStr));
            Assert.Equal(order.OrderTime, token.Value<DateTime>("time"));
            Assert.Equal(order.UserId, token.Value<string>("userId"));
            Assert.Equal(order.RegistrationId, token.Value<int>("registrationId"));

            var userToken = token.Value<JToken>("user");
            Assert.NotNull(userToken);
            if (checkUser)
            {
                Assert.NotEmpty(userToken);
                userToken.CheckUser(order.User);
            }
            else if (checkUserNull)
            {
                Assert.Empty(userToken);
            }

            var registrationToken = token.Value<JToken>("registration");
            Assert.NotNull(registrationToken);
            if (checkRegistration)
            {
                Assert.NotEmpty(registrationToken);
                registrationToken.CheckOrderRegistration(order.Registration);
            }
            else if (checkRegistrationNull)
            {
                Assert.Empty(registrationToken);
            }

            if (checkItems)
            {
                var itemsToken = token.Value<JArray>("items");
                Assert.NotNull(itemsToken);
                itemsToken
                    .CheckArray((t, item) => t.CheckOrderItem(item),
                        order.OrderLines?.ToArray() ?? Array.Empty<OrderLine>());
            }

            return token;
        }

        public static void CheckOrderRegistration(this JToken token, Registration registration)
        {
            Assert.Equal(registration.RegistrationId, token.Value<int>("registrationId"));
            Assert.Equal(registration.EventInfoId, token.Value<int>("eventId"));
            Assert.Equal(registration.UserId, token.Value<string>("userId"));
            Assert.Equal(registration.Status.ToString(), token.Value<string>("status"));
            Assert.Equal(registration.Type.ToString(), token.Value<string>("type"));
            Assert.Equal(registration.Notes, token.Value<string>("notes"));
        }

        public static void CheckOrderItem(this JToken token, OrderLine item)
        {
            if (item.ProductId.HasValue)
            {
                token.Value<JToken>("product").CheckProduct(item.Product);
            }

            if (item.ProductVariantId.HasValue)
            {
                token.Value<JToken>("productVariant").CheckProductVariant(item.ProductVariant);
            }

            Assert.Equal(item.Quantity, token.Value<int>("quantity"));
        }

        public static void CheckRegistrationOrder(this JToken token, Order order)
        {
            Assert.Equal(order.OrderId, token.Value<int>("orderId"));
            token.Value<JArray>("items")
                .CheckArray((t, item) => t.CheckOrderItem(item),
                    order.OrderLines?.ToArray() ?? Array.Empty<OrderLine>());
        }

        public static void CheckRegistrationOrderItem(this JToken token, OrderLine item)
        {
            if (item.ProductId.HasValue)
            {
                token.Value<JToken>("product").CheckProduct(item.Product);
            }

            if (item.ProductVariantId.HasValue)
            {
                token.Value<JToken>("productVariant").CheckProductVariant(item.ProductVariant);
            }

            Assert.Equal(item.Quantity, token.Value<int>("quantity"));
        }

        public static void CheckProduct(this JToken token, Product product, params ProductVariant[] variants)
        {
            Assert.Equal(product.ProductId, token.Value<int>("productId"));
            Assert.Equal(product.Name, token.Value<string>("name"));
            Assert.Equal(product.Description, token.Value<string>("description"));
            Assert.Equal(product.MoreInformation, token.Value<string>("more"));
            Assert.Equal(product.Price, token.Value<decimal>("price"));
            Assert.Equal(product.VatPercent, token.Value<int>("vatPercent"));
            Assert.Equal(product.Visibility.ToString(), token.Value<string>("visibility"));

            if (variants.Any())
            {
                token.Value<JArray>("variants")
                    .CheckArray((t, v) => t
                        .CheckProductVariant(v), variants);
            }
        }

        public static void CheckProductVariant(this JToken token, ProductVariant productVariant)
        {
            Assert.Equal(productVariant.ProductVariantId, token.Value<int>("productVariantId"));
            Assert.Equal(productVariant.Name, token.Value<string>("name"));
            Assert.Equal(productVariant.Description, token.Value<string>("description"));
            Assert.Equal(productVariant.Price, token.Value<decimal>("price"));
            Assert.Equal(productVariant.VatPercent, token.Value<int>("vatPercent"));
        }

        public static void CheckOrganization(this JToken token, Organization organization)
        {
            Assert.Equal(organization.OrganizationId, token.Value<int>("organizationId"));
            Assert.Equal(organization.Name, token.Value<string>("name"));
            Assert.Equal(organization.Description, token.Value<string>("description"));
            Assert.Equal(organization.Url, token.Value<string>("url"));
            Assert.Equal(organization.Phone, token.Value<string>("phone"));
            Assert.Equal(organization.Email, token.Value<string>("email"));
            Assert.Equal(organization.LogoUrl, token.Value<string>("logoUrl"));
            Assert.Equal(organization.LogoBase64, token.Value<string>("logoBase64"));
        }

        public static void CheckNotification(this JToken token,
            Notification notification,
            int? totalSent = null,
            int? totalErrors = null, 
            int? totalRecipients = null)
        {
            Assert.NotEmpty(token);
            Assert.Equal(notification.NotificationId, token.Value<int>("notificationId"));
            Assert.Equal(notification.OrganizationId, token.Value<int?>("organizationId"));
            Assert.Equal(notification.EventInfoId, token.Value<int?>("eventId"));
            Assert.Equal(notification.ProductId, token.Value<int?>("productId"));
            Assert.Equal(notification.Created, token.Value<DateTime>("created"));
            Assert.Equal(notification.StatusUpdated, token.Value<DateTime>("statusUpdated"));
            Assert.Equal(notification.Type.ToString(), token.Value<string>("type"));
            Assert.Equal(notification.Status.ToString(), token.Value<string>("status"));

            if (totalSent.HasValue || totalErrors.HasValue || totalRecipients.HasValue)
            {
                var stats = token.Value<JToken>("statistics");
                Assert.NotNull(stats);
                Assert.NotEmpty(stats);

                if (totalSent.HasValue)
                {
                    Assert.Equal(totalSent, stats.Value<int>("sent"));
                }

                if (totalErrors.HasValue)
                {
                    Assert.Equal(totalErrors, stats.Value<int>("errors"));
                }

                if (totalRecipients.HasValue)
                {
                    Assert.Equal(totalRecipients, stats.Value<int>("recipients"));
                }
            }
        }

        public static void CheckNotificationRecipient(this JToken token, NotificationRecipient recipient)
        {
            Assert.NotEmpty(token);
            Assert.Equal(recipient.RecipientId, token.Value<int>("recipientId"));
            Assert.Equal(recipient.NotificationId, token.Value<int>("notificationId"));
            Assert.Equal(recipient.RecipientUserId, token.Value<string>("recipientUserId"));
            Assert.Equal(recipient.RegistrationId, token.Value<int?>("registrationId"));
            Assert.Equal(recipient.RecipientName, token.Value<string>("recipientName"));
            Assert.Equal(recipient.RecipientIdentifier, token.Value<string>("recipientIdentifier"));
            Assert.Equal(recipient.Created, token.Value<DateTime>("created"));
            Assert.Equal(recipient.Sent, token.Value<DateTime?>("sent"));
            Assert.Equal(recipient.Errors, token.Value<string>("errors"));
        }

        public static void CheckStringArray(this JArray array, params string[] roles)
        {
            array.CheckArray((t, r) => Assert.Equal(r, t.ToString()), roles);
        }

        public static JArray CheckArray<T>(this JArray token, Action<JToken, T> f, params T[] values)
        {
            Assert.Equal(values.Length, token.Count);
            for (var i = 0; i < token.Count; ++i)
            {
                f(token[i], values[i]);
            }

            return token;
        }

        public static JArray CheckEmptyArray(this JArray token)
        {
            Assert.Empty(token);
            return token;
        }

        public static JToken CheckEmptyPaging(this JToken token)
        {
            Assert.Equal(1, token.Value<int>("page"));
            Assert.Equal(0, token.Value<int>("total"));
            Assert.Equal(0, token.Value<int>("pages"));
            token.Value<JArray>("data").CheckEmptyArray();
            return token;
        }

        public static JToken CheckPaging<T>(this JToken token, Action<JToken, T> f,
            params T[] data)
        {
            return CheckPaging(token, 1, null, null, f, data);
        }

        public static JToken CheckPaging<T>(this JToken token, int page, int? total, Action<JToken, T> f,
            params T[] data)
        {
            return CheckPaging(token, page, null, total, f, data);
        }

        public static JToken CheckPaging<T>(this JToken token, int page, int? count, int? total, Action<JToken, T> f,
            params T[] data)
        {
            Assert.Equal(page, token.Value<int>("page"));
            if (count.HasValue)
            {
                Assert.Equal(count.Value, token.Value<int>("count"));
            }

            if (total.HasValue)
            {
                Assert.Equal(total.Value, token.Value<int>("total"));
            }

            var arr = token.Value<JArray>("data");
            arr.CheckArray(f, data);
            return token;
        }
    }
}
