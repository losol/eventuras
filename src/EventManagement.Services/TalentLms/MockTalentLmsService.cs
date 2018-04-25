using System.Threading.Tasks;
using losol.EventManagement.Services.TalentLms.Models;

namespace losol.EventManagement.Services.TalentLms
{
    public class MockTalentLmsService : ITalentLmsService
    {
        public async Task<User> CreateUser(User user) => await Task.FromResult(user);

        public async Task EnrolUserToCourse(User user) => await Task.FromResult(0);

        public async Task<string> GetCourseLink(int userId, int courseId) => 
            await Task.FromResult<string>(null);
    }
}