using System.Threading.Tasks;
using Losol.Communication.Email;

namespace Eventuras.Services.Email;

public interface IApplicationEmailSender
{
    Task SendEmailWithTemplateAsync(
        string viewName,
        string address,
        string subject,
        object viewModel = null,
        params Attachment[] attachments);

    Task SendStandardEmailAsync(
        string address,
        string subject,
        string message,
        params Attachment[] attachments);
}
