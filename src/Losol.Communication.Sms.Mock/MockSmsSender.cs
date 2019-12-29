using System.Threading.Tasks;

namespace Losol.Communication.Sms.Mock
{
    public class MockSmsSender : ISmsSender
    {
        public Task SendSmsAsync(string to, string body)
        {
            return Task.CompletedTask;
        }
    }
}
