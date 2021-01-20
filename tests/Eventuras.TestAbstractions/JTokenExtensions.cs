using System;
using System.Linq;
using Eventuras.Domain;
using Newtonsoft.Json.Linq;
using Xunit;

namespace Eventuras.TestAbstractions
{
    public static class JTokenExtensions
    {
        public static void CheckRegistration(this JToken token, Registration registration)
        {
            Assert.Equal(registration.RegistrationId, token.Value<int>("registrationId"));
            // TODO: check other fields
            token.Value<JArray>("products").CheckArray((json, line) =>
            {
                json.CheckOrderLine(line);
            }, registration.Orders.SelectMany(o => o.OrderLines).ToArray());
        }

        public static void CheckOrderLine(this JToken token, OrderLine line)
        {
            if (line == null)
            {
                Assert.Empty(token);
                return;
            }

            token.Value<JToken>("item1").CheckProduct(line.Product);
            token.Value<JToken>("item2").CheckProductVariant(line.ProductVariant);
            Assert.Equal(line.Quantity, token.Value<int>("item3"));
        }

        public static void CheckProduct(this JToken token, Product product)
        {
            if (product == null)
            {
                Assert.Empty(token);
                return;
            }
            Assert.Equal(product.ProductId, token.Value<int>("productId"));
            Assert.Equal(product.Name, token.Value<string>("name"));
        }

        public static void CheckProductVariant(this JToken token, ProductVariant variant)
        {
            if (variant == null)
            {
                Assert.Empty(token);
                return;
            }
            Assert.Equal(variant.ProductVariantId, token.Value<int>("ProductVariantId"));
            Assert.Equal(variant.Name, token.Value<string>("Name"));
        }

        public static void CheckExternalEvent(this JToken token, ExternalEvent externalEvent)
        {
            if (externalEvent == null)
            {
                Assert.Empty(token);
                return;
            }
            Assert.Equal(externalEvent.LocalId, token.Value<int>("localId"));
            Assert.Equal(externalEvent.ExternalServiceName, token.Value<string>("externalServiceName"));
            Assert.Equal(externalEvent.ExternalEventId, token.Value<string>("externalEventId"));
        }

        public static void CheckEvent(this JToken token, EventInfo e)
        {
            if (e == null)
            {
                Assert.Empty(token);
                return;
            }
            Assert.Equal(e.EventInfoId, token.Value<int>("id"));
            Assert.Equal(e.Title, token.Value<string>("name"));
            Assert.Equal(e.Code, token.Value<string>("slug"));
            Assert.Equal(e.Description, token.Value<string>("description"));
            Assert.Equal(e.Featured, token.Value<bool>("featured"));
            Assert.Equal(e.DateStart, token.Value<DateTime?>("startDate"));
            Assert.Equal(e.DateEnd, token.Value<DateTime?>("endDate"));
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
    }
}
