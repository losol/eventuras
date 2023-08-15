using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Losol.Communication.Email;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Eventuras.Web.Controllers.Api.V1;

[ApiVersion("1")]
[Authorize(Policy = AuthPolicies.AdministratorRole)]
[Route("api/v1/emails")]
[ApiController]
public class EmailsController : ControllerBase
{
    private readonly IEmailSender _emailSender;
    private readonly ILogger<EmailsController> _logger;

    public EmailsController(IEmailSender emailSender, ILogger<EmailsController> logger)
    {
        _emailSender = emailSender ?? throw new ArgumentNullException(nameof(emailSender));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    [HttpPost]
    public async Task<IActionResult> SendEmailsAsync([FromBody] BulkEmailRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState.FormatErrors());

        var response = new BulkEmailResponse();

        var from = request.From != null ? NewAddress(request.From.Name, request.From.Email) : null;

        var cc = request.Cc?.Select(dto => NewAddress(dto.Name, dto.Email)).ToArray();

        var attachments = request.Attachments?.Select(a => new Attachment
            {
                Bytes = Convert.FromBase64String(a.Content),
                Filename = a.FileName,
            })
            .ToList();

        await Task.WhenAll(request.To.Select(async dto =>
            {
                try
                {
                    await _emailSender.SendEmailAsync(new EmailModel
                    {
                        Subject = request.Subject,
                        From = from,
                        TextBody = request.Content.Text,
                        HtmlBody = request.Content.Html,
                        Recipients = new[] { NewAddress(dto.Name, dto.Email) },
                        Cc = cc,
                        Attachments = attachments,
                    });
                    ++response.Sent;
                }
                catch (Exception e)
                {
                    _logger.LogError(e, "Failed to send email to {name} <{email}>", dto.Name, dto.Email);
                    response.Errors.Add(new BulkEmailResponseError
                    {
                        Name = dto.Name,
                        Email = dto.Email,
                        Message = e.Message,
                    });
                }
            })
            .ToArray());

        return Ok(response);
    }

    private static Address NewAddress(string name, string email) => !string.IsNullOrEmpty(name) ? new Address(name, email) : new Address(email);
}

public class BulkEmailAddressDto
{
    [Required]
    [EmailAddress]
    [MinLength(1)]
    [MaxLength(255)]
    public string Email { get; set; }

    [MinLength(1)]
    [MaxLength(255)]
    public string Name { get; set; }
}

public class BulkEmailContentDto
{
    [MaxLength(10 * 1024 * 1024)] // 10 MB Max 
    public string Text { get; set; }

    [MaxLength(10 * 1024 * 1024)] // 10 MB Max 
    public string Html { get; set; }
}

public class ValidContentAttribute : ValidationAttribute
{
    protected override ValidationResult IsValid(object value, ValidationContext validationContext)
    {
        if (!(value is BulkEmailContentDto content) || string.IsNullOrEmpty(content.Text) && string.IsNullOrEmpty(content.Html))
            return new ValidationResult("Email content isn't set");

        return ValidationResult.Success;
    }
}

public class EmailMessageAttachmentDto
{
    [Required]
    public string Content { get; set; }

    [Required]
    [MinLength(1)]
    [MaxLength(255)]
    public string FileName { get; set; }
}

public class BulkEmailRequest
{
    public BulkEmailAddressDto From { get; set; }

    [Required]
    [MinLength(1)]
    [MaxLength(500)]
    [CheckChildren]
    public BulkEmailAddressDto[] To { get; set; }

    [MaxLength(500)]
    [CheckChildren]
    public BulkEmailAddressDto[] Cc { get; set; }

    [Required]
    [MaxLength(255)]
    public string Subject { get; set; }

    [Required]
    [ValidContent]
    public BulkEmailContentDto Content { get; set; }

    [MaxLength(10)]
    [CheckChildren]
    public EmailMessageAttachmentDto[] Attachments { get; set; }
}

public class BulkEmailResponseError
{
    public string Name { get; set; }

    public string Email { get; set; }

    public string Message { get; set; }
}

public class BulkEmailResponse
{
    public int Sent { get; set; }

    public List<BulkEmailResponseError> Errors { get; } = new();
}