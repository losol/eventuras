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

        public static void CheckRegistration(this JToken token, Registration registration)
        {
            Assert.Equal(registration.RegistrationId, token.Value<int>("registrationId"));
            Assert.Equal(registration.EventInfoId, token.Value<int>("eventId"));
            Assert.Equal(registration.UserId, token.Value<string>("userId"));
            Assert.Equal((int)registration.Status, token.Value<int>("status"));
            Assert.Equal((int)registration.Type, token.Value<int>("type"));
            Assert.Equal(registration.Notes, token.Value<string>("notes"));
        }

        public static void CheckEvent(this JToken token, EventInfo eventInfo)
        {
            Assert.Equal(eventInfo.EventInfoId, token.Value<int>("id"));
            Assert.Equal(eventInfo.Type, (EventInfo.EventInfoType)token.Value<int>("type"));
            Assert.Equal(eventInfo.Title, token.Value<string>("name"));
            Assert.Equal(eventInfo.Code, token.Value<string>("slug"));
            Assert.Equal(eventInfo.Category, token.Value<string>("category"));
            Assert.Equal(eventInfo.Description, token.Value<string>("description"));
            Assert.Equal(eventInfo.Program, token.Value<string>("program"));
            Assert.Equal(eventInfo.PracticalInformation, token.Value<string>("practicalInformation"));
            Assert.Equal(eventInfo.OnDemand, token.Value<bool>("onDemand"));
            Assert.Equal(eventInfo.Featured, token.Value<bool>("featured"));
            Assert.Equal(eventInfo.DateStart, token.Value<DateTime?>("startDate"));
            Assert.Equal(eventInfo.DateEnd, token.Value<DateTime?>("endDate"));
            Assert.Equal(eventInfo.LastRegistrationDate, token.Value<DateTime?>("lastRegistrationDate"));

            var location = token.Value<JToken>("location");
            var address = location?.Value<JToken>("address");
            Assert.Equal(eventInfo.Location, location?.Value<string>("name"));
            Assert.Equal(eventInfo.City, address?.Any() == true ? address.Value<string>("addressLocality") : null);
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

        public static JToken CheckPaging<T>(this JToken token, int page, int? total, Action<JToken, T> f,
            params T[] data)
        {
            return CheckPaging(token, page, null, total, f, data);
        }

        public static JToken CheckPaging<T>(this JToken token, int page, int? count, int? total, Action<JToken, T> f, params T[] data)
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
