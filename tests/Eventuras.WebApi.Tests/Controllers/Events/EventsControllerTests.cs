using Eventuras.Domain;
using Eventuras.TestAbstractions;
using Eventuras.WebApi.Controllers.Events;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Eventuras.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Eventuras.WebApi.Tests.Controllers.Events
{
    public class EventsControllerTests : IClassFixture<CustomWebApiApplicationFactory<Startup>>, IDisposable
    {
        private readonly CustomWebApiApplicationFactory<Startup> _factory;

        public EventsControllerTests(CustomWebApiApplicationFactory<Startup> factory)
        {
            _factory = factory;
        }

        public void Dispose()
        {
            using var scope = _factory.Services.NewTestScope();
            scope.Db.EventInfos.Clean();
            scope.Db.SaveChanges();
        }

        #region List

        [Fact]
        public async Task Should_Not_Require_Auth_For_Listing_Events()
        {
            var client = _factory.CreateClient();

            var response = await client.GetAsync("/v3/events");
            response.CheckOk();

            var token = await response.AsTokenAsync();
            token.CheckEmptyPaging();
        }

        [Theory]
        [MemberData(nameof(GetInvalidFilterParams))]
        public async Task Should_Validate_Filter_Params_For_Event_List(string query)
        {
            var client = _factory.CreateClient();
            var response = await client.GetAsync($"/v3/events?{query}");
            response.CheckBadRequest();
        }

        public static object[][] GetInvalidFilterParams()
        {
            return new[]
            {
                new object[]{ "page=asd" },
                new object[]{ "count=asd" },
                new object[]{ "page=-1" },
                new object[]{ "page=0" },
                new object[]{ "count=-1" },
                new object[]{ "type=invalid" },
                new object[]{ "type=-1" },
                new object[]{ "type=100" },
                new object[]{ "start=asd" },
                new object[]{ "start=1" },
                new object[]{ "end=asd" },
                new object[]{ "end=1" },
                new object[]{ "period=asd" },
                new object[]{ "period=-1" },
                new object[]{ "period=100" },
                new object[]{ "organizationId=-1" },
                new object[]{ "organizationId=0" },
                new object[]{ "organizationId=abc" },
            };
        }

        [Fact]
        public async Task Should_Use_Paging_For_Event_List()
        {
            using var scope = _factory.Services.NewTestScope();
            using var e3 = await scope.CreateEventAsync("E3", dateStart: DateTime.UtcNow.AddDays(3));
            using var e2 = await scope.CreateEventAsync("E2", dateStart: DateTime.UtcNow.AddDays(2));
            using var e1 = await scope.CreateEventAsync("E1", dateStart: DateTime.UtcNow.AddDays(1));

            var client = _factory.CreateClient();

            var response = await client.GetAsync("/v3/events?page=1&count=2");
            response.CheckOk();

            var token = await response.AsTokenAsync();
            token.CheckPaging(1, 3, (t, e) => t.CheckEvent(e), e1.Entity, e2.Entity);

            response = await client.GetAsync("/v3/events?page=2&count=2");
            response.CheckOk();

            token = await response.AsTokenAsync();
            token.CheckPaging(2, 3, (t, e) => t.CheckEvent(e), e3.Entity);
        }

        [Fact]
        public async Task Should_Not_List_Past_Events()
        {
            using var scope = _factory.Services.NewTestScope();
            using var e1 = await scope.CreateEventAsync(dateStart: DateTime.UtcNow.AddDays(-1));
            using var e2 = await scope.CreateEventAsync(dateStart: DateTime.UtcNow.AddDays(1));
            using var e3 = await scope.CreateEventAsync(dateStart: DateTime.UtcNow.AddDays(2));

            var client = _factory.CreateClient();

            var response = await client.GetAsync("/v3/events");
            response.CheckOk();

            var token = await response.AsTokenAsync();
            token.CheckPaging(1, 2, (t, e) => t.CheckEvent(e), e2.Entity, e3.Entity);
        }

        [Fact]
        public async Task Should_Not_List_Archived_Events()
        {
            using var scope = _factory.Services.NewTestScope();
            using var e1 = await scope.CreateEventAsync(dateStart: DateTime.UtcNow.AddDays(2), archived: true);
            using var e2 = await scope.CreateEventAsync(dateStart: DateTime.UtcNow.AddDays(2), archived: false);

            var client = _factory.CreateClient();

            var response = await client.GetAsync("/v3/events");
            response.CheckOk();

            var token = await response.AsTokenAsync();
            token.CheckPaging(1, 1, (t, e) => t.CheckEvent(e), e2.Entity);
        }

        [Fact]
        public async Task Should_Filter_Event_List_By_Event_Type()
        {
            using var scope = _factory.Services.NewTestScope();
            using var conference = await scope.CreateEventAsync(eventInfoType: EventInfo.EventInfoType.Conference, dateStart: DateTime.UtcNow.AddDays(1));
            using var course1 = await scope.CreateEventAsync(eventInfoType: EventInfo.EventInfoType.Course, dateStart: DateTime.UtcNow.AddDays(1));
            using var course2 = await scope.CreateEventAsync(eventInfoType: EventInfo.EventInfoType.Course, dateStart: DateTime.UtcNow.AddDays(2));
            using var other = await scope.CreateEventAsync(eventInfoType: EventInfo.EventInfoType.Other, dateStart: DateTime.UtcNow.AddDays(1));

            var client = _factory.CreateClient();

            var response = await client.GetAsync("/v3/events?type=conference");
            response.CheckOk();

            var token = await response.AsTokenAsync();
            token.CheckPaging(1, 1, (t, e) => t.CheckEvent(e), conference.Entity);

            response = await client.GetAsync("/v3/events?type=course");
            response.CheckOk();

            token = await response.AsTokenAsync();
            token.CheckPaging(1, 2, (t, e) => t.CheckEvent(e), course1.Entity, course2.Entity);

            response = await client.GetAsync("/v3/events?type=other");
            response.CheckOk();

            token = await response.AsTokenAsync();
            token.CheckPaging(1, 1, (t, e) => t.CheckEvent(e), other.Entity);
        }

        [Theory]
        [MemberData(nameof(GetDateMatchingFilterTestParams))]
        public async Task Should_Select_Events_By_Date(DateFilter filter)
        {
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync(dateStart: filter.EventStart, dateEnd: filter.EventEnd);

            var client = _factory.CreateClient();

            var response = await client.GetAsync($"/v3/events?{filter.ToQueryString()}");
            response.CheckOk();

            var token = await response.AsTokenAsync();
            token.CheckPaging(1, 1, (t, e) => t.CheckEvent(e), evt.Entity);
        }

        public static object[][] GetDateMatchingFilterTestParams()
        {
            var now = DateTime.UtcNow;
            var yesterday = now.AddDays(-1);
            var tomorrow = now.AddDays(1);

            return new[]
            {
                // M. EXACT MATCH TESTS
                // M1. NOT specifying period param in query

                new object[]{ DateFilter.Default("M1.1", yesterday.Date, null, yesterday) },
                new object[]{ DateFilter.Default("M1.2", yesterday.Date, now.Date, yesterday, now) },
                new object[]{ DateFilter.Default("M1.3", null, now.Date, null, now) },
                
                // M2. specifying period param in query
                
                new object[]{ DateFilter.Match("M2.1", yesterday.Date, null, yesterday) },
                new object[]{ DateFilter.Match("M2.2", yesterday.Date, now.Date, yesterday, now) },
                new object[]{ DateFilter.Match("M2.3", null, now.Date, null, now) },

                // I. INTERSECTION TESTS
                // I1. start date only filter
                
                /*
                 * Event:     [-------------------
                 * Filter:    [-------------------
                 */
                new object[]{ DateFilter.Intersect("I1.1", yesterday, null, yesterday) },
                new object[]{ DateFilter.Intersect("I1.2", now, null, now) },
                new object[]{ DateFilter.Intersect("I1.3", tomorrow, null, tomorrow) },
                new object[]{ DateFilter.Intersect("I1.4", yesterday.Date, null, yesterday) },  // start date itself should be included
                new object[]{ DateFilter.Intersect("I1.5", tomorrow.Date, null, tomorrow) }, // start date itself should be included
                new object[]{ DateFilter.Intersect("I1.6", now.Date, null, now) }, // start date itself should be included

                /*
                 * Event:     [-------------------
                 * Filter:   [--------------------
                 */
                new object[]{ DateFilter.Intersect("I1.7", tomorrow, null, yesterday) },
                new object[]{ DateFilter.Intersect("I1.8", tomorrow, null, now) },

                /*
                 * Event:     [-------------------
                 * Filter:      [-----------------
                 */
                new object[]{ DateFilter.Intersect("I1.9", yesterday, null, now) },
                new object[]{ DateFilter.Intersect("I1.10", yesterday, null, tomorrow) },

                /*
                 * Event:     [--------------]
                 * Filter:    [-----------------
                 */
                new object[]{ DateFilter.Intersect("I1.11", now, tomorrow, now) },

                /*
                 * Event:     [--------------]
                 * Filter:                 [---------------
                 */
                new object[]{ DateFilter.Intersect("I1.12", yesterday, tomorrow, now.Date) },

                /*
                 * Event:     [--------------]
                 * Filter:                   [---------------
                 */
                new object[]{ DateFilter.Intersect("I1.13", yesterday, now.Date, now) }, // end date should be included

                // I2. end date only filter
                 
                /*
                 * Event:     [----------]
                 * Filter:    -----------]
                 */
                new object[]{ DateFilter.Intersect("I2.1", now.AddDays(-10), yesterday.Date, null, yesterday) },  // end date itself should be included
                new object[]{ DateFilter.Intersect("I2.2", yesterday, now, null, now) },
                new object[]{ DateFilter.Intersect("I2.3", yesterday, now.Date, null, now) }, // end date itself should be included
                new object[]{ DateFilter.Intersect("I2.4", yesterday, tomorrow, null, tomorrow) },
                new object[]{ DateFilter.Intersect("I2.5", yesterday, tomorrow.Date, null, tomorrow) },

                /*
                 * Event:     [----------]
                 * Filter:    --------]
                 */
                new object[]{ DateFilter.Intersect("I2.6", yesterday, tomorrow, null, now) },

                // I3. start & end date filter

                /*
                 * Event:                   [-------------------]
                 * Filter: [----------------]
                 */
                new object[]{ DateFilter.Intersect("I3.1", now.AddDays(-5).Date, now.AddDays(5), now.AddDays(-10), now.AddDays(-5)) },

                /*
                 * Event:       [-------------------]
                 * Filter: [-------------]
                 */
                new object[]{ DateFilter.Intersect("I3.2", now.AddDays(-5), now.AddDays(5), now.AddDays(-10), now) },

                /*
                 * Event:     [-------------------]
                 * Filter:         [--------]
                 */
                new object[]{ DateFilter.Intersect("I3.3", now.AddDays(-10), now.AddDays(10), now.AddDays(-5), now.AddDays(5)) },

                /*
                 * Event:     [-------------------]
                 * Filter:               [--------]
                 */
                new object[]{ DateFilter.Intersect("I3.4", now.AddDays(-5), now.AddDays(5), now, now.AddDays(5)) },

                /*
                 * Event:     [-------------------]
                 * Filter:               [-----------------]
                 */
                new object[]{ DateFilter.Intersect("I3.5", now.AddDays(-5), now.AddDays(5), now, now.AddDays(10)) },

                /*
                 * Event:     [-------------------]
                 * Filter:                        [-----------------]
                 */
                new object[]{ DateFilter.Intersect("I3.6", now.AddDays(-5), now.AddDays(5), now.AddDays(5), now.AddDays(10)) },

                /*
                 * Event:     [-------------------]
                 * Filter:  [------------------------]
                 */
                new object[]{ DateFilter.Intersect("I3.7", now.AddDays(-5), now.AddDays(5), now.AddDays(-10), now.AddDays(10)) },

                // C. CONTAINS FILTER TESTS
                // C1. start date only filter
                
                /*
                 * Event:     [-------------------
                 * Filter:    [-------------------
                 */
                new object[]{ DateFilter.Contain("C1.1", yesterday, null, yesterday) },
                new object[]{ DateFilter.Contain("C1.2", now, null, now) },
                new object[]{ DateFilter.Contain("C1.3", tomorrow, null, tomorrow) },
                new object[]{ DateFilter.Contain("C1.4", yesterday.Date, null, yesterday) },  // start date itself should be included
                new object[]{ DateFilter.Contain("C1.5", tomorrow.Date, null, tomorrow) }, // start date itself should be included
                new object[]{ DateFilter.Contain("C1.6", now.Date, null, now) }, // start date itself should be included

                /*
                 * Event:     [-------------------
                 * Filter:   [--------------------
                 */
                new object[]{ DateFilter.Contain("C1.7", tomorrow, null, yesterday) },
                new object[]{ DateFilter.Contain("C1.8", tomorrow, null, now) },

                /*
                 * Event:     [--------------]
                 * Filter:    [-----------------
                 */
                new object[]{ DateFilter.Contain("C1.9", now, tomorrow, now) },

                // C2. end date only filter
                 
                /*
                 * Event:     [----------]
                 * Filter:    -----------]
                 */
                new object[]{ DateFilter.Contain("C2.1", now.AddDays(-10), yesterday.Date, null, yesterday) },  // end date itself should be included
                new object[]{ DateFilter.Contain("C2.2", yesterday, now.Date, null, now) }, // end date itself should be included
                new object[]{ DateFilter.Contain("C2.3", yesterday, tomorrow.Date, null, tomorrow) },

                // C3. start & end date filter

                /*
                 * Event:     [-------------------]
                 * Filter:  [------------------------]
                 */
                new object[]{ DateFilter.Contain("C3.1", now.AddDays(-5), now.AddDays(5), now.AddDays(-10), now.AddDays(10)) },
            };
        }

        [Theory]
        [MemberData(nameof(GetDateNotMatchingFilterTestParams))]
        public async Task Should_Not_Select_Events_By_Date(DateFilter filter)
        {
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync(dateStart: filter.EventStart, dateEnd: filter.EventEnd);

            var client = _factory.CreateClient();

            var response = await client.GetAsync($"/v3/events?{filter.ToQueryString()}");
            response.CheckOk();

            var token = await response.AsTokenAsync();
            token.CheckEmptyPaging();
        }

        public static object[][] GetDateNotMatchingFilterTestParams()
        {
            var now = DateTime.UtcNow;
            var yesterday = now.AddDays(-1);
            var tomorrow = now.AddDays(1);

            return new[]
            {
                // M. EXACT MATCH TESTS
                // M1. NOT specifying period param in query

                new object[]{ DateFilter.Default("~M1.1", yesterday.Date, null, now) },
                new object[]{ DateFilter.Default("~M1.2", yesterday.Date, now.Date, yesterday, tomorrow) },
                new object[]{ DateFilter.Default("~M1.3", null, now.Date, null, yesterday) },
                
                // M2. specifying period param in query
                
                new object[]{ DateFilter.Match("~M2.1", yesterday.Date, null, now) },
                new object[]{ DateFilter.Match("~M2.2", yesterday.Date, now.Date, yesterday, tomorrow) },
                new object[]{ DateFilter.Match("~M2.3", null, now.Date, null, yesterday) },

                // I. INTERSECTION TESTS
                // I1. start date only filter

                /*
                 * Event:     [--------------]
                 * Filter:                    [---------------
                 */
                new object[]{ DateFilter.Intersect("~I1.1", yesterday, now, tomorrow) },

                // I2. end date only filter

                /*
                 * Event:              [----------]
                 * Filter:    --------]
                 */
                new object[]{ DateFilter.Intersect("~I2.1", now, tomorrow, null, yesterday) },

                // I3. start & end date filter

                /*
                 * Event:                    [-------------------]
                 * Filter: [----------------]
                 */
                new object[]{ DateFilter.Intersect("~I3.1", now.AddDays(-5).Date, now.AddDays(5), now.AddDays(-10), now.AddDays(-6)) },

                /*
                 * Event:     [-------------------]
                 * Filter:                         [-----------------]
                 */
                new object[]{ DateFilter.Intersect("~I3.2", now.AddDays(-5), now.AddDays(5), now.AddDays(6), now.AddDays(10)) },

                // C. CONTAINS FILTER TESTS

                // C1. start date only filter

                /*
                 * Event:     [-------------------
                 * Filter:      [--------------------
                 */
                new object[]{ DateFilter.Contain("~C1.1", yesterday, null, now) },
                new object[]{ DateFilter.Contain("~C1.2", now.Date.AddSeconds(-1), null, now) },

                /*
                 * Event:     ----------------]
                 * Filter:      [--------------------
                 */
                new object[]{ DateFilter.Contain("~C1.3", null, tomorrow, now) },

                /*
                 * Event:     [----------]
                 * Filter:      [--------------------
                 */
                new object[]{ DateFilter.Contain("~C1.4", yesterday, tomorrow, now) },

                // C2. end date only filter
                 
                /*
                 * Event:     -----------]
                 * Filter:    ----------]
                 */
                new object[]{ DateFilter.Contain("~C2.1", null, tomorrow, null, now) },
                new object[]{ DateFilter.Contain("~C2.2", null, now.Date.AddSeconds(-1), null, now) },

                /*
                 * Event:     [----------]
                 * Filter:    ----------]
                 */
                new object[]{ DateFilter.Contain("~C2.3", yesterday, now, null, now) },
                new object[]{ DateFilter.Contain("~C2.3", yesterday, tomorrow, null, now) },
                new object[]{ DateFilter.Contain("~C2.4", yesterday, now.Date.AddSeconds(1), null, now) },

                // C3. start & end date filter

                /*
                 * Event:                   [-------------------]
                 * Filter: [----------------]
                 */
                new object[]{ DateFilter.Contain("~C3.1", now.AddDays(-5).Date, now.AddDays(5), now.AddDays(-10), now.AddDays(-5)) },

                /*
                 * Event:       [-------------------]
                 * Filter: [-------------]
                 */
                new object[]{ DateFilter.Contain("~C3.2", now.AddDays(-5), now.AddDays(5), now.AddDays(-10), now) },

                /*
                 * Event:     [-------------------]
                 * Filter:         [--------]
                 */
                new object[]{ DateFilter.Contain("~C3.3", now.AddDays(-10), now.AddDays(10), now.AddDays(-5), now.AddDays(5)) },

                /*
                 * Event:     [-------------------]
                 * Filter:               [--------]
                 */
                new object[]{ DateFilter.Contain("~C3.4", now.AddDays(-5), now.AddDays(5), now, now.AddDays(5)) },

                /*
                 * Event:     [-------------------]
                 * Filter:               [-----------------]
                 */
                new object[]{ DateFilter.Contain("~C3.5", now.AddDays(-5), now.AddDays(5), now, now.AddDays(10)) },

                /*
                 * Event:     [-------------------]
                 * Filter:                        [-----------------]
                 */
                new object[]{ DateFilter.Contain("~C3.6", now.AddDays(-5), now.AddDays(5), now.AddDays(5), now.AddDays(10)) }
            };
        }

        [Fact]
        public async Task Should_Filter_Event_List_By_OrganizationId()
        {
            using var scope = _factory.Services.NewTestScope();
            using var org1 = await scope.CreateOrganizationAsync();
            using var org2 = await scope.CreateOrganizationAsync();
            using var evt1 = await scope.CreateEventAsync(organization: org1.Entity, organizationId: org1.Entity.OrganizationId, dateStart: DateTime.UtcNow.AddDays(1));
            using var evt2 = await scope.CreateEventAsync(organization: org2.Entity, organizationId: org2.Entity.OrganizationId, dateStart: DateTime.UtcNow.AddDays(1));

            var client = _factory.CreateClient();

            var response = await client.GetAsync("/v3/events", new { organizationId = org1.Entity.OrganizationId });
            response.CheckOk();

            var token = await response.AsTokenAsync();
            token.CheckPaging((t, e) => t.CheckEvent(e), evt1.Entity);

            response = await client.GetAsync("/v3/events", new { organizationId = org2.Entity.OrganizationId });
            response.CheckOk();

            token = await response.AsTokenAsync();
            token.CheckPaging((t, e) => t.CheckEvent(e), evt2.Entity);
        }

        #endregion

        #region Read

        [Fact]
        public async Task Should_Not_Require_Auth_For_Reading_Event()
        {
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync();

            var client = _factory.CreateClient();

            var response = await client.GetAsync($"/v3/events/{evt.Entity.EventInfoId}");
            response.CheckOk();

            var token = await response.AsTokenAsync();
            token.CheckEvent(evt.Entity);
        }

        [Fact]
        public async Task Should_Return_Not_Found_When_Reading_Non_Existing_Event()
        {
            var client = _factory.CreateClient();
            var response = await client.GetAsync("/v3/events/1000001");
            response.CheckNotFound();
        }

        [Fact]
        public async Task Should_Return_Not_Found_When_Reading_Archived_Event()
        {
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync(archived: true);

            var client = _factory.CreateClient();
            var response = await client.GetAsync($"/v3/events/{evt.Entity.EventInfoId}");
            response.CheckNotFound();
        }

        #endregion

        #region Create

        [Fact]
        public async Task Should_Require_Auth_To_Create_Event()
        {
            var client = _factory.CreateClient();
            var response = await client.PostAsync("/v3/events", new { });
            response.CheckUnauthorized();
        }

        [Fact]
        public async Task Should_Require_Admin_Role_To_Create_Event()
        {
            var client = _factory.CreateClient().Authenticated();
            var response = await client.PostAsync("/v3/events", new { });
            response.CheckForbidden();
        }

        [Theory]
        [MemberData(nameof(GetInvalidEventFormParams))]
        public async Task Should_Validate_New_Event_Form(object form)
        {
            var client = _factory.CreateClient().AuthenticatedAsAdmin();
            var response = await client.PostAsync("/v3/events", form);
            response.CheckBadRequest();
        }

        public static object[][] GetInvalidEventFormParams()
        {
            return new[]
            {
                new object[]{ new
                {
                    // no slug
                } },
                new object[]{ new
                {
                    // invalid type
                    slug = "test",
                    type = "some"
                } },
                new object[]{ new
                {
                    // end date before start date
                    slug = "test",
                    startDate = "2030-02-01",
                    endDate = "2030-01-01"
                } },
                new object[]{ new
                {
                    // invalid start date 
                    slug = "test",
                    startDate = "asd"
                } },
                new object[]{ new
                {
                    // invalid end date 
                    slug = "test",
                    endDate = "asd"
                } },
            };
        }

        [Fact]
        public async Task Should_Check_For_Duplicate_Slug_When_Creating_Event()
        {
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync(slug: "test");

            var client = _factory.CreateClient().AuthenticatedAsAdmin();
            var response = await client.PostAsync("/v3/events", new
            {
                slug = evt.Entity.Slug
            });
            response.CheckConflict();
        }

        [Fact]
        public async Task Should_Ignore_Duplicate_Archived_Slug_When_Creating_Event()
        {
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync(title: "asdf", organizationId: 1, slug: "test", archived: true);

            var client = _factory.CreateClient().AuthenticatedAsAdmin();
            var response = await client.PostAsync("/v3/events", new
            {
                title = "asdf",
                organizationId = 1,
                slug = evt.Entity.Slug
            });
            response.CheckOk();

            var token = await response.AsTokenAsync();
            var e = await scope.Db.EventInfos
                .AsNoTracking()
                .SingleAsync(e => e.Slug == "test" &&
                                  e.EventInfoId != evt.Entity.EventInfoId);
            token.CheckEvent(e);
        }

        [Theory]
        [InlineData(Roles.Admin)]
        [InlineData(Roles.SystemAdmin)]
        public async Task Should_Create_Event_With_Min_Data(string role)
        {
            using var scope = _factory.Services.NewTestScope();

            var client = _factory.CreateClient().Authenticated(role: role);
            var response = await client.PostAsync("/v3/events", new
            {
                title = "test title",
                organizationId = 1,
                slug = "test"
            });
            response.CheckOk();

            var e = await scope.Db.EventInfos.AsNoTracking().SingleAsync(e => e.Slug == "test");
            Assert.Equal(EventInfo.EventInfoType.Course, e.Type);

            var token = await response.AsTokenAsync();
            token.CheckEvent(e);
        }

        [Theory]
        [InlineData(Roles.Admin)]
        [InlineData(Roles.SuperAdmin)]
        [InlineData(Roles.SystemAdmin)]
        public async Task Should_Create_Event_With_Max_Data(string role)
        {
            using var scope = _factory.Services.NewTestScope();

            var client = _factory.CreateClient().Authenticated(role: role);
            var response = await client.PostAsync("/v3/events", new
            {
                type = (int)EventInfo.EventInfoType.Conference,
                title = "Test Event",
                slug = "test",
                organizationId = 1,
                category = "Test event category",
                description = "Test event description",
                manageRegistrations = true,
                onDemand = true,
                featured = true,
                program = "Test event program",
                practicalInformation = "Test information",
                startDate = "2030-01-01",
                endDate = "2030-01-02"
            });
            response.CheckOk();

            var evt = await scope.Db.EventInfos
                .AsNoTracking()
                .SingleAsync(e => e.Slug == "test");

            Assert.Equal(EventInfo.EventInfoType.Conference, evt.Type);
            Assert.Equal("Test Event", evt.Title);
            Assert.Equal("Test event category", evt.Category);
            Assert.Equal("Test event description", evt.Description);
            Assert.True(evt.ManageRegistrations);
            Assert.True(evt.OnDemand);
            Assert.True(evt.Featured);
            Assert.Equal("Test event program", evt.Program);
            Assert.Equal("Test information", evt.PracticalInformation);
            Assert.Equal(new DateTime(2030, 1, 1), evt.DateStart?.Date);
            Assert.Equal(new DateTime(2030, 1, 2), evt.DateEnd?.Date);

            var token = await response.AsTokenAsync();
            token.CheckEvent(evt);
        }

        #endregion

        #region Update

        [Fact]
        public async Task Should_Require_Auth_To_Update_Event()
        {
            var client = _factory.CreateClient();
            var response = await client.PutAsync($"/v3/events/10001", new { });
            response.CheckUnauthorized();
        }

        [Fact]
        public async Task Should_Require_Admin_Role_To_Update_Event()
        {
            var client = _factory.CreateClient().Authenticated();
            var response = await client.PutAsync("/v3/events/10001", new { });
            response.CheckForbidden();
        }

        [Theory]
        [MemberData(nameof(GetInvalidEventFormParams))]
        public async Task Should_Validate_Update_Event_Form(object form)
        {
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync();

            var client = _factory.CreateClient().Authenticated(role: Roles.Admin);
            var response = await client.PutAsync($"/v3/events/{evt.Entity.EventInfoId}", form);
            response.CheckBadRequest();
        }

        [Fact]
        public async Task Should_Return_Not_Found_When_Updating_Non_Existing_Event()
        {
            var client = _factory.CreateClient().Authenticated(role: Roles.Admin);
            var response = await client.PutAsync("/v3/events/10001", new { title = "asdf", organizationId = 1, slug = "test" });
            response.CheckNotFound();
        }

        [Fact]
        public async Task Should_Return_Not_Found_When_Updating_Archived_Event()
        {
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync(archived: true);

            var client = _factory.CreateClient().Authenticated(role: Roles.Admin);
            var response = await client.PutAsync($"/v3/events/{evt.Entity.EventInfoId}", new { title = "asf", organizationId = 1, slug = "test" });
            response.CheckNotFound();
        }

        [Fact]
        public async Task Should_Check_For_Duplicate_Slug_When_Updating_Event()
        {
            using var scope = _factory.Services.NewTestScope();
            using var e1 = await scope.CreateEventAsync();
            using var e2 = await scope.CreateEventAsync();

            var client = _factory.CreateClient().AuthenticatedAsAdmin();
            var response = await client.PutAsync($"/v3/events/{e1.Entity.EventInfoId}", new
            {
                organizationId = 1,
                title = "test title",
                slug = e2.Entity.Slug
            });
            response.CheckConflict();
        }

        [Fact]
        public async Task Should_Allow_To_Specify_Same_Slug_When_Updating_Event()
        {
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync(slug: "test");

            var client = _factory.CreateClient().AuthenticatedAsAdmin();
            var response = await client.PutAsync($"/v3/events/{evt.Entity.EventInfoId}", new
            {
                title = "asdf",
                organizationId = 1,
                slug = evt.Entity.Slug
            });
            response.CheckOk();

            var updatedEvent = await scope.Db.EventInfos
                .AsNoTracking()
                .SingleAsync(e => e.EventInfoId == evt.Entity.EventInfoId);

            Assert.Equal(evt.Entity.Slug, updatedEvent.Slug);
        }

        [Theory]
        [InlineData(Roles.Admin)]
        [InlineData(Roles.SystemAdmin)]
        public async Task Should_Update_Event(string role)
        {
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync();

            var client = _factory.CreateClient().Authenticated(role: role);
            var response = await client.PutAsync($"/v3/events/{evt.Entity.EventInfoId}", new
            {
                type = EventInfo.EventInfoType.Other,
                title = "Test Event",
                slug = "test",
                organizationId = 1,
                category = "Test event category",
                description = "Test event description",
                manageRegistrations = true,
                onDemand = true,
                featured = true,
                program = "Test event program",
                practicalInformation = "Test information",
                startDate = "2030-01-01",
                endDate = "2030-01-02"
            });
            response.CheckOk();

            var updated = await scope.Db.EventInfos
                .AsNoTracking()
                .SingleAsync(e => e.EventInfoId == evt.Entity.EventInfoId);

            Assert.Equal(EventInfo.EventInfoType.Other, updated.Type);
            Assert.Equal("Test Event", updated.Title);
            Assert.Equal("Test event category", updated.Category);
            Assert.Equal("Test event description", updated.Description);
            Assert.True(updated.ManageRegistrations);
            Assert.True(updated.OnDemand);
            Assert.True(updated.Featured);
            Assert.Equal("Test event program", updated.Program);
            Assert.Equal("Test information", updated.PracticalInformation);
            Assert.Equal(new DateTime(2030, 1, 1), updated.DateStart?.Date);
            Assert.Equal(new DateTime(2030, 1, 2), updated.DateEnd?.Date);

            var token = await response.AsTokenAsync();
            token.CheckEvent(updated);
        }

        #endregion

        #region Delete

        [Fact]
        public async Task Should_Require_Auth_To_Delete_Event()
        {
            var client = _factory.CreateClient();
            var response = await client.DeleteAsync("/v3/events/10001");
            response.CheckUnauthorized();
        }

        [Fact]
        public async Task Should_Require_Admin_Role_To_Delete_Event()
        {
            var client = _factory.CreateClient().Authenticated();
            var response = await client.DeleteAsync("/v3/events/10001");
            response.CheckForbidden();
        }

        [Fact]
        public async Task Should_Return_Ok_When_Deleting_Non_Existing_Event()
        {
            var client = _factory.CreateClient().Authenticated(role: Roles.Admin);
            var response = await client.DeleteAsync("/v3/events/10001");
            response.CheckOk();
        }

        [Fact]
        public async Task Should_Return_Ok_When_Deleting_Archived_Event()
        {
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync(archived: true);

            var client = _factory.CreateClient().Authenticated(role: Roles.Admin);
            var response = await client.DeleteAsync($"/v3/events/{evt.Entity.EventInfoId}");
            response.CheckOk();
        }

        [Theory]
        [InlineData(Roles.Admin)]
        [InlineData(Roles.SystemAdmin)]
        [InlineData(Roles.SuperAdmin)]
        public async Task Should_Soft_Delete_Event(string role)
        {
            using var scope = _factory.Services.NewTestScope();
            using var evt = await scope.CreateEventAsync();
            Assert.False(evt.Entity.Archived);

            var client = _factory.CreateClient().Authenticated(role: role);
            var response = await client.DeleteAsync($"/v3/events/{evt.Entity.EventInfoId}");
            response.CheckOk();

            var updated = await scope.Db.EventInfos
                .AsNoTracking()
                .SingleAsync(e => e.EventInfoId == evt.Entity.EventInfoId);

            Assert.True(updated.Archived);
        }

        #endregion
    }

    public class DateFilter
    {
        public string Name { get; }

        public DateTime? EventStart { get; }

        public DateTime? EventEnd { get; }

        public DateTime? FilterStart { get; }

        public DateTime? FilterEnd { get; }

        public PeriodMatchingKind? Matching { get; }

        private DateFilter(
            string name,
            DateTime? eventStart,
            DateTime? eventEnd,
            DateTime? filterStart,
            DateTime? filterEnd,
            PeriodMatchingKind? matching)
        {
            Name = name;
            EventStart = eventStart;
            EventEnd = eventEnd;
            FilterStart = filterStart;
            FilterEnd = filterEnd;
            Matching = matching;
        }

        public string ToQueryString()
        {
            var parts = new List<string>();
            if (FilterStart.HasValue)
            {
                parts.Add($"start={FilterStart:yyyy-MM-dd}");
            }
            if (FilterEnd.HasValue)
            {
                parts.Add($"end={FilterEnd:yyyy-MM-dd}");
            }
            if (Matching.HasValue)
            {
                parts.Add($"period={Matching.Value.ToString().ToLower()}");
            }
            return string.Join("&", parts);
        }

        public override string ToString()
        {
            return Name;
        }

        public static DateFilter Default(
            string name,
            DateTime? eventStart,
            DateTime? eventEnd = null,
            DateTime? filterStart = null,
            DateTime? filterEnd = null)
        {
            return new DateFilter(name, eventStart, eventEnd, filterStart, filterEnd, null);
        }

        public static DateFilter Match(
            string name,
            DateTime? eventStart,
            DateTime? eventEnd = null,
            DateTime? filterStart = null,
            DateTime? filterEnd = null)
        {
            return new DateFilter(name, eventStart, eventEnd, filterStart, filterEnd, PeriodMatchingKind.Match);
        }

        public static DateFilter Intersect(
            string name,
            DateTime? eventStart,
            DateTime? eventEnd = null,
            DateTime? filterStart = null,
            DateTime? filterEnd = null)
        {
            return new DateFilter(name, eventStart, eventEnd, filterStart, filterEnd, PeriodMatchingKind.Intersect);
        }

        public static DateFilter Contain(
            string name,
            DateTime? eventStart,
            DateTime? eventEnd = null,
            DateTime? filterStart = null,
            DateTime? filterEnd = null)
        {
            return new DateFilter(name, eventStart, eventEnd, filterStart, filterEnd, PeriodMatchingKind.Contain);
        }
    }
}
