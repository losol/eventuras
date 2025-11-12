using Eventuras.TestAbstractions;
using Microsoft.Extensions.Options;
using System;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Xunit;
using Xunit.Sdk;

namespace Eventuras.Services.TalentLms.Tests
{
    public class TalentLmsApiServiceTests : IDisposable
    {
        private readonly SingletonHttpClientFactory _httpClientFactory = new SingletonHttpClientFactory();
        private readonly ITalentLmsApiService _service;

        public TalentLmsApiServiceTests(ITestOutputHelper output)
        {
            _service = new TalentLmsApiService(_httpClientFactory,
                Options.Create(TalentLmsTestEnv.GetSettingsFromEnv()),
                XUnitLoggerFactory.CreateLogger<TalentLmsApiService>(output));
        }

        public void Dispose()
        {
            _httpClientFactory.Dispose();
        }

        [Fact]
        public async Task User_Sign_Up_Must_Require_Non_Null_Request()
        {
            await Assert.ThrowsAsync<ArgumentNullException>(() => _service.UserSignUpAsync(null));
        }

        [Theory]
        [MemberData(nameof(GetInvalidTalentLmsUserSignInData))]
        internal async Task Should_Throw_Validation_Exception_If_Request_Is_Invalid(TalentLmsUserSignUpRequest request)
        {
            await Assert.ThrowsAsync<ValidationException>(() => _service.UserSignUpAsync(request));
        }

        [TalentLmsEnvSpecificFact]
        public async Task Should_Register_New_User()
        {
            await _service.DeleteAllUsersAsync();

            var id = Guid.NewGuid();
            var email = $"test-{id}@email.com";
            var firstName = "Test";
            var lastName = $"User {id}";
            var login = $"test-login-{id}";
            var password = "test12345";

            var response = await _service.UserSignUpAsync(new TalentLmsUserSignUpRequest
            {
                Email = email,
                FirstName = firstName,
                LastName = lastName,
                Login = login,
                Password = password
            });

            Assert.NotNull(response);
            Assert.Equal(firstName, response.FirstName);
            Assert.Equal(lastName, response.LastName);
            Assert.Equal(email, response.Email);
            Assert.Equal(login, response.Login);
            Assert.NotEmpty(response.Id);
        }

        [Theory]
        [InlineData(null, "test", "learner")]
        [InlineData("", "test", "learner")]
        [InlineData("test", null, "learner")]
        [InlineData("test", "", "learner")]
        [InlineData("test", "test", null)]
        [InlineData("test", "test", "")]
        [InlineData("test", "test", "test")]
        public async Task Should_Validate_Enrollment_Parameters(string userId, string courseId, string role)
        {
            await Assert.ThrowsAsync<ValidationException>(() => _service.EnrollUserToCourseAsync(new TalentLmsEnrollmentDto
            {
                UserId = userId,
                CourseId = courseId,
                Role = role
            }));
        }

        [TalentLmsEnvSpecificTheory]
        [InlineData(TalentLmsEnrollmentDto.Instructor)]
        [InlineData(TalentLmsEnrollmentDto.Learner)]
        public async Task Should_Enroll_User_To_Course(string role)
        {
            await _service.DeleteAllUsersAsync();

            var courseId = Environment.GetEnvironmentVariable(TalentLmsTestEnv.CourseIdEnvKey);

            var email = $"test-user-{Guid.NewGuid()}@email.com";
            var user = await _service.UserSignUpAsync(new TalentLmsUserSignUpRequest
            {
                Email = email,
                FirstName = "Test",
                LastName = "User",
                Login = email,
                Password = "test"
            });

            var response = await _service.EnrollUserToCourseAsync(new TalentLmsEnrollmentDto
            {
                UserId = user.Id,
                CourseId = courseId,
                Role = role
            });

            Assert.NotNull(response);
            Assert.Equal(user.Id, response.UserId);
            Assert.Equal(courseId, response.CourseId);
            Assert.Equal(TalentLmsEnrollmentDto.Learner, response.Role);
        }

        public static object[][] GetInvalidTalentLmsUserSignInData()
        {
            return new[]
            {
                new object[]{new TalentLmsUserSignUpRequest { Email = null, FirstName = "Test", LastName = "Test", Password = "Test", Login = "Test" } },
                new object[]{new TalentLmsUserSignUpRequest { Email = "", FirstName = "Test", LastName = "Test", Password = "Test", Login = "Test" } },
                new object[]{new TalentLmsUserSignUpRequest { Email = "invalid", FirstName = "Test", LastName = "Test", Password = "Test", Login = "Test" } },
                new object[]{new TalentLmsUserSignUpRequest { Email = "valid@email.com", FirstName = null, LastName = "Test", Password = "Test", Login = "Test" } },
                new object[]{new TalentLmsUserSignUpRequest { Email = "valid@email.com", FirstName = "", LastName = "Test", Password = "Test", Login = "Test" } },
                new object[]{new TalentLmsUserSignUpRequest { Email = "valid@email.com", FirstName = " ", LastName = "Test", Password = "Test", Login = "Test" } },
                new object[]{new TalentLmsUserSignUpRequest { Email = "valid@email.com", FirstName = "Test", LastName = null, Password = "Test", Login = "Test" } },
                new object[]{new TalentLmsUserSignUpRequest { Email = "valid@email.com", FirstName = "Test", LastName = "", Password = "Test", Login = "Test" } },
                new object[]{new TalentLmsUserSignUpRequest { Email = "valid@email.com", FirstName = "Test", LastName = " ", Password = "Test", Login = "Test" } },
                new object[]{new TalentLmsUserSignUpRequest { Email = "valid@email.com", FirstName = "Test", LastName = null, Password = "Test", Login = "Test" } },
                new object[]{new TalentLmsUserSignUpRequest { Email = "valid@email.com", FirstName = "Test", LastName = "", Password = "Test", Login = "Test" } },
                new object[]{new TalentLmsUserSignUpRequest { Email = "valid@email.com", FirstName = "Test", LastName = " ", Password = "Test", Login = "Test" } },
                new object[]{new TalentLmsUserSignUpRequest { Email = "valid@email.com", FirstName = "Test", LastName = "Test", Password = null, Login = "Test" } },
                new object[]{new TalentLmsUserSignUpRequest { Email = "valid@email.com", FirstName = "Test", LastName = "Test", Password = "", Login = "Test" } },
                new object[]{new TalentLmsUserSignUpRequest { Email = "valid@email.com", FirstName = "Test", LastName = "Test", Password = " ", Login = "Test" } },
                new object[]{new TalentLmsUserSignUpRequest { Email = "valid@email.com", FirstName = "Test", LastName = "Test", Password = "Test", Login = null } },
                new object[]{new TalentLmsUserSignUpRequest { Email = "valid@email.com", FirstName = "Test", LastName = "Test", Password = "Test", Login = "" } },
                new object[]{new TalentLmsUserSignUpRequest { Email = "valid@email.com", FirstName = "Test", LastName = "Test", Password = "Test", Login = " " } }
            };
        }
    }
}
