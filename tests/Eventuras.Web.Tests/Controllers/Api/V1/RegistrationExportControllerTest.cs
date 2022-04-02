using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using Eventuras.Domain;
using Eventuras.IntegrationTests;
using Eventuras.TestAbstractions;
using NodaTime;
using Xunit;

namespace Eventuras.Web.Tests.Controllers.Api.V1
{
    public class RegistrationExportControllerTest : IClassFixture<CustomWebApplicationFactory<Startup>>
    {
        private readonly CustomWebApplicationFactory<Startup> _factory;

        public RegistrationExportControllerTest(CustomWebApplicationFactory<Startup> factory)
        {
            _factory = factory;
        }

        [Fact(Skip = "FIXME: add auth tokens instead of cookies and return Unauthorized response")]
        public async Task Should_Require_Auth_To_Export_Registrations()
        {
            var client = _factory.CreateClient();
            var response = await client.GetAsync("/api/v1/registrations/export");
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact(Skip = "FIXME: add auth tokens instead of cookies and return Forbidden response")]
        public async Task Should_Require_Admin_Role_To_Export_Registrations()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();

            var client = _factory.CreateClient();
            await client.LoginAsync(user.Entity.Email, TestingConstants.DefaultPassword);

            var response = await client.GetAsync("/api/v1/registrations/export");
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task Should_Export_Empty_Registrations_List()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewTestScope();
            var response = await client.GetAsync("/api/v1/registrations/export");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Theory]
        [InlineData(true)]
        [InlineData(false)]
        public async Task Should_Export_All_Registrations(bool exportHeader)
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewTestScope();

            using var e1 = await scope.CreateEventAsync();
            using var e2 = await scope.CreateEventAsync();
            using var p1 = await scope.CreateProductAsync(e1.Entity);
            using var p2 = await scope.CreateProductAsync(e2.Entity);
            using var v1 = await scope.CreateProductVariantAsync(p1.Entity);
            using var v2 = await scope.CreateProductVariantAsync(p1.Entity);
            using var u1 = await scope.CreateUserAsync();
            using var u2 = await scope.CreateUserAsync();
            using var r1 = await scope.CreateRegistrationAsync(e1.Entity, u1.Entity,
                time: SystemClock.Instance.Now().Minus(Duration.FromDays(3)));
            using var r2 = await scope.CreateRegistrationAsync(e1.Entity, u2.Entity,
                time: SystemClock.Instance.Now().Minus(Duration.FromDays(2)));
            using var r3 = await scope.CreateRegistrationAsync(e2.Entity, u2.Entity,
                time: SystemClock.Instance.Now().Minus(Duration.FromDays(1)));
            using var o1 = await scope.CreateOrderAsync(r1.Entity, p1.Entity, v1.Entity);
            using var o2 = await scope.CreateOrderAsync(r3.Entity, p2.Entity, quantity: 10);

            var response = await client.GetAsync($"/api/v1/registrations/export?header={exportHeader}");
            await CheckSuccessfulResponseAsync(response, exportHeader, r3.Entity, r2.Entity, r1.Entity);
        }

        [Fact(Skip = "FIXME: add auth tokens instead of cookies and return Unauthorized response")]
        public async Task Should_Require_Auth_To_Export_Registrations_For_Event()
        {
            var client = _factory.CreateClient();
            var response = await client.GetAsync("/api/v1/registrations/export/1");
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact(Skip = "FIXME: add auth tokens instead of cookies and return Forbidden response")]
        public async Task Should_Require_Admin_Role_To_Export_Registrations_For_Event()
        {
            using var scope = _factory.Services.NewTestScope();
            using var user = await scope.CreateUserAsync();

            var client = _factory.CreateClient();
            await client.LoginAsync(user.Entity.Email, TestingConstants.DefaultPassword);

            var response = await client.GetAsync("/api/v1/registrations/export/1");
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task Should_Export_Empty_Registrations_List_For_Event()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewTestScope();
            var response = await client.GetAsync("/api/v1/registrations/export/1");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Theory]
        [InlineData(true)]
        [InlineData(false)]
        public async Task Should_Export_Registrations_For_Event(bool exportHeader)
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            using var scope = _factory.Services.NewTestScope();

            using var e1 = await scope.CreateEventAsync();
            using var e2 = await scope.CreateEventAsync();
            using var p1 = await scope.CreateProductAsync(e1.Entity);
            using var p2 = await scope.CreateProductAsync(e2.Entity);
            using var v1 = await scope.CreateProductVariantAsync(p1.Entity);
            using var v2 = await scope.CreateProductVariantAsync(p1.Entity);
            using var u1 = await scope.CreateUserAsync();
            using var u2 = await scope.CreateUserAsync();
            using var r1 = await scope.CreateRegistrationAsync(e1.Entity, u1.Entity,
                time: SystemClock.Instance.Now().Minus(Duration.FromDays(3)));
            using var r2 = await scope.CreateRegistrationAsync(e1.Entity, u2.Entity,
                time: SystemClock.Instance.Now().Minus(Duration.FromDays(2)));
            using var r3 = await scope.CreateRegistrationAsync(e2.Entity, u2.Entity,
                time: SystemClock.Instance.Now().Minus(Duration.FromDays(1)));
            using var o1 = await scope.CreateOrderAsync(r1.Entity, p1.Entity, v1.Entity);
            using var o2 = await scope.CreateOrderAsync(r3.Entity, p2.Entity, quantity: 10);

            var response =
                await client.GetAsync($"/api/v1/registrations/export/{e1.Entity.EventInfoId}?header={exportHeader}");
            await CheckSuccessfulResponseAsync(response, exportHeader, r2.Entity, r1.Entity);

            response = await client.GetAsync(
                $"/api/v1/registrations/export/{e2.Entity.EventInfoId}?header={exportHeader}");
            await CheckSuccessfulResponseAsync(response, exportHeader, r3.Entity);
        }

        private static async Task CheckSuccessfulResponseAsync(HttpResponseMessage response,
            bool exportHeader,
            params Registration[] registrations)
        {
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Equal("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                response.Content.Headers.ContentType.MediaType);
            Assert.NotNull(response.Content.Headers.ContentDisposition);
            Assert.EndsWith(".xlsx", response.Content.Headers.ContentDisposition.FileName);

            await using var stream = await response.Content.ReadAsStreamAsync();
            CheckExcelDocument(stream, exportHeader, registrations);
        }

        private static void CheckExcelDocument(Stream stream, bool checkHeader, params Registration[] registrations)
        {
            using var spreadsheetDocument =
                SpreadsheetDocument.Open(stream, false);

            var workbookPart = spreadsheetDocument.WorkbookPart;
            var worksheetPart = workbookPart.WorksheetParts.First();
            var sheetData = worksheetPart.Worksheet.Elements<SheetData>().First();

            var rows = sheetData.Elements<Row>().ToArray();
            if (checkHeader)
            {
                var headerRow = rows.First();
                Assert.Equal(new[]
                {
                    "RegistrationId",
                    "ParticipantName",
                    "ParticipantEmail",
                    "ParticipantPhone",
                    "Products",
                    "RegistrationStatus",
                    "RegistrationType"
                }, headerRow.Elements<Cell>().Select(c => c.CellValue.Text));
                rows = rows.Skip(1).ToArray();
            }

            Assert.Equal(registrations.Length, rows.Count());

            for (var i = 0; i < registrations.Length; ++i)
            {
                var registration = registrations[i];
                var row = rows[i];
                var cellText = row.Elements<Cell>().Select(c => c.CellValue.Text).ToArray();
                Assert.Contains(registration.RegistrationId.ToString(), cellText);
                Assert.Contains(registration.ParticipantName, cellText);
                Assert.Contains(registration.User.Email, cellText);
                Assert.Contains(registration.User.PhoneNumber, cellText);
                Assert.Contains(registration.Status.ToString(), cellText);
                Assert.Contains(registration.Type.ToString(), cellText);

                if (registration.Orders?.Any() == true)
                {
                    var productText = cellText[4];
                    Assert.NotEmpty(productText);
                    foreach (var product in registration.Products)
                    {
                        Assert.Contains(
                            product.Quantity > 1
                                ? $"{product.Quantity} × {product.Product.Name}"
                                : product.Product.Name, productText);
                        if (product.Variant != null)
                        {
                            Assert.Contains($"({product.Variant.Name})", productText);
                        }
                    }
                }
            }
        }
    }
}
