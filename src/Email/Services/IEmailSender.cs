using System.Threading.Tasks;

namespace Losol.Communication.Email.Services
{
    public interface IEmailSender
    {
        Task SendEmailAsync(string name, string email, string subject, string htmlMessage);
    }
}