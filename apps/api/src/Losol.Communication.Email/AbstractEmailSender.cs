using System;
using System.Threading.Tasks;

namespace Losol.Communication.Email;

public abstract class AbstractEmailSender : IEmailSender
{
    public async Task SendEmailAsync(EmailModel emailModel, EmailOptions options = null)
    {
        emailModel.Validate();

        try
        {
            await SendEmailInternalAsync(emailModel);
        }
        catch (EmailSenderException)
        {
            throw;
        }
        catch (Exception e)
        {
            throw new EmailSenderException(e.Message, e);
        }
    }


    /// <exception cref="EmailSenderException">Failed to send email</exception>
    protected abstract Task SendEmailInternalAsync(EmailModel emailModel);
}
