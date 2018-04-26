using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using RestSharp;

using losol.EventManagement.Services.Extensions;
using losol.EventManagement.Services.TalentLms.Models;

namespace losol.EventManagement.Services.TalentLms
{
    public class TalentLmsService : ITalentLmsService
    {

        private readonly TalentLmsOptions _options;
        public TalentLmsService(IOptions<TalentLmsOptions> options)
        {
            _options = options.Value;
        }

        public async Task<User> CreateUser(User user)
        {
            var client = new RestClient($"{_options.BaseUrl}/usersignup");
            var request = new RestRequest(Method.POST);
            request.AddHeader("Authorization", $"Basic {_options.ApiKeySha}");
            request.AddHeader("Content-Type", "application/json");
            request.AddBody(user);
            var response = await client.ExecuteAsync<User>(request);
            return response.Data;
        }

        public async Task EnrolUserToCourse(User user)
        {
            var client = new RestClient($"{_options.BaseUrl}/addusertocourse");
            var request = new RestRequest(Method.POST);
            request.AddHeader("Authorization", $"Basic {_options.ApiKeySha}");
            request.AddHeader("Content-Type", "application/json");
            var requestBody = new 
            {
                user_id = 2,
                course_id = 126,
                role = "learner"
            };
            request.AddBody(requestBody);
            await client.ExecuteAsync(request);
        }

        public async Task<string> GetCourseLink(int userId, int courseId)
        {
            var client = new RestClient($"{_options.BaseUrl}/gotocourse/user_id:{userId},course_id:{courseId}");
            var request = new RestRequest(Method.GET);
            request.AddHeader("Authorization", $"Basic {_options.ApiKeySha}");
            var response = await client.ExecuteAsync<GetCourseLinkResponse>(request);
            return response.Data.goto_url;
        }

        private class GetCourseLinkResponse 
        {
            public string goto_url { get; set; }
        }
    }
}
