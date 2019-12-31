using System.Threading.Tasks;

namespace Losol.Communication.Email.Mock
{
    public class MockEmailSender : IEmailSender
    {
        public Task SendEmailAsync(string address, string subject, string message, Attachment attachment = null,
            EmailMessageType messageType = EmailMessageType.Html)
        {
            return Task.CompletedTask;
        }
    }
}
