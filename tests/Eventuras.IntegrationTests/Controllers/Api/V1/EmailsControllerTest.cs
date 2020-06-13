using Newtonsoft.Json;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Losol.Communication.Email;
using Moq;
using Xunit;

namespace Eventuras.IntegrationTests.Controllers.Api.V1
{
    public class EmailsControllerTest : IClassFixture<CustomWebApplicationFactory<Startup>>
    {
        private readonly CustomWebApplicationFactory<Startup> _factory;

        public EmailsControllerTest(CustomWebApplicationFactory<Startup> factory)
        {
            _factory = factory;
        }

        [Fact(Skip = "FIXME: add auth tokens instead of cookies and return Unauthorized response")]
        public async Task Should_Require_Auth_To_Send_Emails()
        {
            var client = _factory.CreateClient();
            var response = await client.PostAsync("/api/v1/emails", new StringContent("{}", Encoding.UTF8, "application/json"));
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact(Skip = "FIXME: add auth tokens instead of cookies and return Forbidden response")]
        public async Task Should_Require_Admin_Role_To_Send_Emails()
        {
            using var scope = _factory.Services.NewScope();
            using var user = await scope.ServiceProvider.CreateUserAsync();

            var client = _factory.CreateClient();
            await client.LoginAsync(user.Entity.Email, ServiceProviderExtensions.DefaultPassword);

            var response = await client.PostAsync("/api/v1/emails", new StringContent("{}", Encoding.UTF8, "application/json"));
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Theory]
        [MemberData(nameof(InvalidRequestData))]
        public async Task Should_Validate_Email_Request_And_Return_400_Bad_Request(string request)
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            var response = await client.PostAsync("/api/v1/emails", new StringContent(request, Encoding.UTF8, "application/json"));
            await response.CheckBadRequestAsync();
        }

        [Fact]
        public async Task Should_Not_Allow_To_Send_To_More_Than_500_Recipients()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            var emails = Enumerable.Range(0, 501)
                .Select(i => $"email{i}@test.com")
                .ToArray();

            var response = await client.PostAsync("/api/v1/emails", new StringContent(JsonConvert.SerializeObject(new
            {
                to = emails.Select(email => new { email }),
                subject = "test",
                content = new
                {
                    html = "test"
                }
            }), Encoding.UTF8, "application/json"));

            await response.CheckBadRequestAsync();
        }

        [Fact]
        public async Task Should_Allow_To_Send_To_Exactly_500_Recipients()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            var emails = Enumerable.Range(0, 500)
                .Select(i => $"email+{i}@test.com")
                .ToArray();

            var response = await client.PostAsync("/api/v1/emails", new StringContent(JsonConvert.SerializeObject(new
            {
                to = emails.Select(email => new { email }),
                subject = "test",
                content = new
                {
                    html = "test"
                }
            }), Encoding.UTF8, "application/json"));
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            _factory.EmailSenderMock.Verify(s => s.SendEmailAsync(
                It.Is<EmailModel>(model => model.Recipients.Length == 1 &&
                                           model.Recipients[0].Email.StartsWith("email+") &&
                                           model.Recipients[0].Email.EndsWith("@test.com") &&
                                           model.Subject == "test" &&
                                           model.HtmlBody == "test")),
                Times.Exactly(500));
        }

        [Fact]
        public async Task Should_Not_Allow_To_Send_To_More_Than_500_Cc_Addresses()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            var emails = Enumerable.Range(0, 501)
                .Select(i => $"email{i}@test.com")
                .ToArray();

            var response = await client.PostAsync("/api/v1/emails", new StringContent(JsonConvert.SerializeObject(new
            {
                to = new
                {
                    email = "test@email.com"
                },
                cc = emails.Select(email => new { email }),
                subject = "test",
                content = new
                {
                    html = "test"
                }
            }), Encoding.UTF8, "application/json"));

            await response.CheckBadRequestAsync();
        }

        [Fact]
        public async Task Should_Allow_To_Send_To_Exactly_500_Cc_Addresses()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            var emails = Enumerable.Range(0, 500)
                .Select(i => $"email{i}@test.com")
                .ToArray();

            var json = JsonConvert.SerializeObject(new
            {
                to = new[] { new { email = "test@email.com" } },
                cc = emails.Select(email => new { email }),
                subject = "test",
                content = new
                {
                    html = "test"
                }
            });

            var response = await client.PostAsync("/api/v1/emails", new StringContent(json, Encoding.UTF8, "application/json"));
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            _factory.EmailSenderMock.Verify(s => s.SendEmailAsync(
                    It.Is<EmailModel>(model => model.Recipients.Length == 1 &&
                                               model.Recipients[0].Email == "test@email.com" &&
                                               model.Cc != null &&
                                               model.Cc.Length == 500 &&
                                               model.Cc.All(a => a.Email.StartsWith("email") && a.Email.EndsWith("@test.com")) &&
                                               model.Subject == "test" &&
                                               model.HtmlBody == "test")),
                Times.Exactly(1));
        }

        [Fact]
        public async Task Should_Not_Allow_To_Send_Email_With_Text_Body_Larger_Than_10_mb()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            var text = "".PadRight(10 * 1024 * 1024 + 1, 'a');
            var json = JsonConvert.SerializeObject(new
            {
                to = new[] { new { email = "test@email.com" } },
                subject = "test",
                content = new { text }
            });

            var response = await client.PostAsync("/api/v1/emails", new StringContent(json, Encoding.UTF8, "application/json"));
            await response.CheckBadRequestAsync();
        }

        [Fact]
        public async Task Should_Not_Allow_To_Send_Email_With_Html_Body_Larger_Than_10_mb()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            var html = "".PadRight(10 * 1024 * 1024 + 1, 'a');
            var json = JsonConvert.SerializeObject(new
            {
                to = new[] { new { email = "test@email.com" } },
                subject = "test",
                content = new { html }
            });

            var response = await client.PostAsync("/api/v1/emails", new StringContent(json, Encoding.UTF8, "application/json"));
            await response.CheckBadRequestAsync();
        }

        [Fact]
        public async Task Should_Not_Allow_To_Send_Email_With_Subject_Longer_Than_255_Symbols()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            var json = JsonConvert.SerializeObject(new
            {
                to = new[] { new { email = "test@email.com" } },
                subject = "".PadRight(256, 'a'),
                content = new { text = "test" }
            });

            var response = await client.PostAsync("/api/v1/emails", new StringContent(json, Encoding.UTF8, "application/json"));
            await response.CheckBadRequestAsync();
        }

        [Fact]
        public async Task Should_Not_Allow_To_Send_Email_With_Attachment_File_Name_Longer_Than_255_Symbols()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            var json = JsonConvert.SerializeObject(new
            {
                to = new[] { new { email = "test@email.com" } },
                subject = "test",
                content = new { text = "test" },
                attachments = new[]{ new
                {
                    content = "test",
                    fileName = "".PadRight(256, 'a')
                } }
            });

            var response = await client.PostAsync("/api/v1/emails", new StringContent(json, Encoding.UTF8, "application/json"));
            await response.CheckBadRequestAsync();
        }

        [Fact]
        public async Task Should_Not_Allow_To_Send_More_Than_10_Attachments()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            var json = JsonConvert.SerializeObject(new
            {
                to = new[] { new { email = "test@email.com" } },
                subject = "test",
                content = new { text = "test" },
                attachments = Enumerable.Range(0, 11)
                    .Select(i => new
                    {
                        fileName = $"file {i}",
                        content = "test"
                    })
            });

            var response = await client.PostAsync("/api/v1/emails", new StringContent(json, Encoding.UTF8, "application/json"));
            await response.CheckBadRequestAsync();
        }

        [Fact]
        public async Task Should_Allow_To_Send_Exactly_10_Attachments()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            var json = JsonConvert.SerializeObject(new
            {
                to = new[] { new { email = "test@email.com" } },
                subject = "test",
                content = new { text = "test" },
                attachments = Enumerable.Range(0, 10)
                    .Select(i => new
                    {
                        fileName = $"file {i}",
                        content = "dGVzdA=="
                    })
            });

            var response = await client.PostAsync("/api/v1/emails", new StringContent(json, Encoding.UTF8, "application/json"));
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            _factory.EmailSenderMock.Verify(s => s.SendEmailAsync(
                    It.Is<EmailModel>(model => model.Recipients.Length == 1 &&
                                               model.Recipients[0].Email == "test@email.com" &&
                                               model.Subject == "test" &&
                                               model.TextBody == "test" &&
                                               model.Attachments != null &&
                                               model.Attachments.Count == 10 &&
                                               model.Attachments.All(a =>
                                                   !string.IsNullOrEmpty(a.Filename) &&
                                                   a.Filename.StartsWith("file ") &&
                                                   a.Bytes != null &&
                                                   Encoding.UTF8.GetString(a.Bytes) == "test"))),
                Times.Exactly(1));
        }

        [Fact]
        public async Task Should_Allow_To_Send_Email_With_Max_Information()
        {
            var client = _factory.CreateClient();
            await client.LogInAsSuperAdminAsync();

            var text = "".PadRight(10 * 1024 * 1024, 'b');
            var html = "".PadRight(10 * 1024 * 1024, 'c');
            var name = "Test".PadRight(255, 'd');
            var email = "test@email.com".PadRight(255, 'f');
            var subject = "".PadRight(255, 'a');

            var json = JsonConvert.SerializeObject(new
            {
                from = new { name, email },
                to = new[] { new { name, email } },
                cc = new[] { new { name, email } },
                subject,
                content = new { text, html }
            });

            var response = await client.PostAsync("/api/v1/emails", new StringContent(json, Encoding.UTF8, "application/json"));
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            _factory.EmailSenderMock.Verify(s => s.SendEmailAsync(
                    It.Is<EmailModel>(model => model.Recipients.Length == 1 &&
                                               model.Recipients[0].Name == name &&
                                               model.Recipients[0].Email == email &&
                                               model.Cc != null &&
                                               model.Cc.Length == 1 &&
                                               model.Cc[0].Name == name &&
                                               model.Cc[0].Email == email &&
                                               model.From != null &&
                                               model.From.Name == name &&
                                               model.From.Email == email &&
                                               model.Subject == subject &&
                                               model.TextBody == text &&
                                               model.HtmlBody == html)),
                Times.Exactly(1));
        }

        public static object[][] InvalidRequestData = new[]
        {
            // empty request
            new object[]{""},

            // empty JSON
            new object[]{"{}"},

            // no "to" property
            new object[]{JsonConvert.SerializeObject(new
            {
                subject = "test",
                content = new
                {
                    html = "test"
                }
            })},

            // invalid "to" property
            new object[]{JsonConvert.SerializeObject(new
            {
                to = new {
                    email = "invalid"
                },
                subject = "test",
                content = new
                {
                    html = "test"
                }
            })},

            // no "subject" property
            new object[]{JsonConvert.SerializeObject(new
            {
                to = new {
                    email = "test@email.com"
                },
                content = new
                {
                    html = "test"
                }
            })},

            // no "content" property
            new object[]{JsonConvert.SerializeObject(new
            {
                to = new {
                    email = "test@email.com"
                },
                subject = "test"
            })},

            // no "content" property, v2
            new object[]{JsonConvert.SerializeObject(new
            {
                to = new {
                    email = "test@email.com"
                },
                subject = "test",
                content = new {}
            })},

            // invalid "from"
            new object[]{JsonConvert.SerializeObject(new
            {
                from = new
                {
                    email = "invalid"
                },
                to = new {
                    email = "test@email.com"
                },
                subject = "test",
                content = new
                {
                    html = "test"
                }
            })},

            // invalid "cc"
            new object[]{JsonConvert.SerializeObject(new
            {
                to = new {
                    email = "test@email.com"
                },
                cc = new []
                {
                    new { email = "invalid" }
                },
                subject = "test",
                content = new
                {
                    html = "test"
                }
            })},
        };
    }
}
