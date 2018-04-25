using System.Threading.Tasks;
using EventManagement.Services.Extensions;
using losol.EventManagement.Services.TalentLms.Models;
using Microsoft.Extensions.Options;
using RestSharp;

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
            var client = new RestClient($"{_options.BaseUrl}/v1/usersignup");
            var request = new RestRequest(Method.POST);
            request.AddHeader("Authorization", $"Basic {_options.ApiKeySha}");
            request.AddHeader("Content-Type", "application/json");
            request.AddBody(user);
            var response = await client.ExecuteAsync<User>(request);
            return response.Data;
        }

        public async Task EnrolUserToCourse(User user)
        {
            var client = new RestClient($"{_options.BaseUrl}/v1/addusertocourse");
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
    }
}
