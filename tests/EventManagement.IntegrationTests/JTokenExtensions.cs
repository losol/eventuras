using System;
using System.Linq;
using losol.EventManagement.Domain;
using Newtonsoft.Json.Linq;
using Xunit;

namespace losol.EventManagement.IntegrationTests
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

        public static JArray CheckArray<T>(this JArray token, Action<JToken, T> f, params T[] values)
        {
            Assert.Equal(values.Length, token.Count);
            for (var i = 0; i < token.Count; ++i)
            {
                f(token[i], values[i]);
            }
            return token;
        }
    }
}
