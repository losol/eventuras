using System.Text.Encodings.Web;
using System.Threading.Tasks;
using Losol.Communication.Email;

namespace Eventuras.Services;

public static class EmailSenderExtensions
{
    public static Task SendEmailConfirmationAsync(this IEmailSender emailSender, string email, string link)
        => emailSender.SendEmailAsync(email,
            "Confirm your email",
            $"Please confirm your account by <a href='{HtmlEncoder.Default.Encode(link)}'>clicking here</a>.");

    public static Task SendResetPasswordAsync(this IEmailSender emailSender, string email, string callbackUrl)
        => emailSender.SendEmailAsync(email,
            "Reset Password",
            $"Please reset your password by <a href='{HtmlEncoder.Default.Encode(callbackUrl)}'>clicking here</a>.");
}