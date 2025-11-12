using System;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Services.Views;
using Losol.Communication.Email;

namespace Eventuras.Services.Email;

internal class ApplicationEmailSender : IApplicationEmailSender
{
    private const string StandardEmailViewName = "Templates/Email/StandardEmail";
    private readonly IEmailSender _emailSender;

    private readonly IViewRenderService _viewRenderService;

    public ApplicationEmailSender(
        IViewRenderService viewRenderService,
        IEmailSender emailSender)
    {
        _viewRenderService = viewRenderService ?? throw
            new ArgumentNullException(nameof(viewRenderService));

        _emailSender = emailSender ?? throw
            new ArgumentNullException(nameof(emailSender));
    }

    public async Task SendEmailWithTemplateAsync(
        string viewName,
        string address,
        string subject,
        object viewModel = null,
        params Attachment[] attachments)
    {
        if (string.IsNullOrEmpty(viewName))
        {
            throw new ArgumentException($"{nameof(viewName)} must not be empty");
        }

        if (string.IsNullOrEmpty(address))
        {
            throw new ArgumentException($"{nameof(address)} must not be empty");
        }

        if (string.IsNullOrEmpty(subject))
        {
            throw new ArgumentException($"{nameof(subject)} must not be empty");
        }

        var htmlBody = await _viewRenderService
            .RenderViewToStringAsync(viewName, viewModel ?? new object());

        await _emailSender.SendEmailAsync(new EmailModel
        {
            Subject = subject,
            Recipients = new[] { new Address(address) },
            HtmlBody = htmlBody,
            Attachments = attachments.ToList()
        });
    }

    public async Task SendStandardEmailAsync(
        string address,
        string subject,
        string message,
        params Attachment[] attachments)
    {
        if (string.IsNullOrEmpty(address))
        {
            throw new ArgumentException($"{nameof(address)} must not be empty");
        }

        if (string.IsNullOrEmpty(subject))
        {
            throw new ArgumentException($"{nameof(subject)} must not be empty");
        }

        if (string.IsNullOrEmpty(message))
        {
            throw new ArgumentException($"{nameof(message)} must not be empty");
        }

        await SendEmailWithTemplateAsync(StandardEmailViewName, address, subject,
            new ApplicationEmailModel { Subject = subject, Message = message }, attachments);
    }
}

public class ApplicationEmailModel
{
    public string Subject { get; set; }

    public string Message { get; set; }
}
