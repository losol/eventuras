using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Services;
using Eventuras.Services.Email;
using Eventuras.Web.Services;
using Losol.Communication.Sms;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Eventuras.Web.Controllers.Api.V0;

[ApiVersion("0")]
[Authorize(Policy = AuthPolicies.AdministratorRole)]
[Route("/api/v0/messaging")]
public class MessagingController : Controller
{
    private readonly IApplicationEmailSender _emailSender;
    private readonly RegistrationEmailSender _registrationEmailSender;
    private readonly ISmsSender _smsSender;
    private readonly IRegistrationService _registrationService;
    private readonly IMessageLogService _messageLog;
    private readonly ILogger<MessagingController> _logger;

    public MessagingController(
        IApplicationEmailSender emailSender,
        ISmsSender smsSender,
        IRegistrationService registrationService,
        IMessageLogService messageLog,
        RegistrationEmailSender registrationEmailSender,
        ILogger<MessagingController> logger)
    {
        _emailSender = emailSender;
        _registrationEmailSender = registrationEmailSender;
        _logger = logger;
        _smsSender = smsSender;
        _messageLog = messageLog;
        _registrationService = registrationService;
    }

    [HttpPost("email/participants-at-event/{eventInfoId}")]
    public async Task<IActionResult> EmailAll([FromRoute] int eventInfoId, [FromBody] EmailContent email)
    {
        if (!ModelState.IsValid) return BadRequest();

        var recipients = "";
        var errors = "";
        var registrations = await _registrationService.GetRegistrations(eventInfoId);

        foreach (var reg in registrations)
            try
            {
                await _registrationEmailSender.SendRegistrationAsync(reg.User.Email, email.Subject, email.Content, reg.RegistrationId);

                recipients += $@"""{reg.User.Name}"" <{reg.User.Email}>; ";
            }
            catch (Exception exc) { errors += exc.Message + Environment.NewLine; }

        var result = "";
        if (errors == "")
            result = "Alle epost sendt!";
        else
            result = "Sendte epost. Men fikk noen feil: " + Environment.NewLine + errors;

        await _messageLog.AddAsync(eventInfoId, recipients, email.Content, "Email", "SendGrid", result);

        return Ok(result.Replace(Environment.NewLine, "<br />"));
    }

    [HttpPost("sms/participants-at-event/{eventInfoId}")]
    public async Task<IActionResult> SmsAll([FromRoute] int eventInfoId, [FromBody] SmsContent sms)
    {
        if (!ModelState.IsValid) return BadRequest();

        var recipients = "";
        var errors = "";
        var registrations = await _registrationService.GetRegistrations(eventInfoId);

        foreach (var reg in registrations)
            try
            {
                await _smsSender.SendSmsAsync(reg.User.PhoneNumber, sms.Content);
                recipients += $@"""{reg.User.Name}"" <{reg.User.PhoneNumber}>; ";
            }
            catch (Exception exc) { errors += exc.Message + Environment.NewLine; }

        var result = "";
        if (errors == "")
            result = "Alle SMS sendt!";
        else
            result = "Sendte SMS. Men fikk noen feil: " + Environment.NewLine + errors;

        await _messageLog.AddAsync(eventInfoId, recipients, sms.Content, "SMS", "Twilio", result);

        return Ok(result.Replace(Environment.NewLine, "<br />"));
    }

    [HttpPost("email")]
    public async Task<IActionResult> SendEmail([FromBody] EmailVM vm)
    {
        if (!ModelState.IsValid) return BadRequest();

        var errors = "";
        var emailTasks = vm.To.Select(r => _emailSender.SendStandardEmailAsync($"{r.Name} <{r.Email}>", vm.Subject, vm.Message));
        try { await Task.WhenAll(emailTasks); }
        catch (Exception exc) { errors += exc.Message + Environment.NewLine; }

        var result = "";
        if (errors == "")
            result = "Epost sendt!";
        else
            result = "Sendte epost. Men fikk noen feil: " + Environment.NewLine + errors;

        return Ok(result.Replace(Environment.NewLine, "<br />"));
    }

    [HttpPost("sms")]
    public async Task<IActionResult> SendSms([FromBody] SmsVM vm)
    {
        if (!ModelState.IsValid) return BadRequest();

        var smsTasks = vm.To.Select(t => _smsSender.SendSmsAsync(t, vm.Text));
        var errors = "";
        try { await Task.WhenAll(smsTasks); }
        catch (Exception exc)
        {
            _logger.LogError(exc, "Error occurred during SMS sending");
            errors += exc.Message + Environment.NewLine;
        }

        var result = "";
        if (errors == "")
            result = "Alle SMS sendt!";
        else
            result = "Sendte SMS. Men fikk noen feil: " + Environment.NewLine + errors;

        if (vm.EventInfoId.HasValue) await _messageLog.AddAsync(vm.EventInfoId.Value, string.Join(";", vm.To), vm.Text, "SMS", "Twilio", result);

        return Ok(result.Replace(Environment.NewLine, "<br />"));
    }

    public class EmailContent
    {
        public string Subject { get; set; }

        public string Content { get; set; }
    }

    public class SmsContent
    {
        public string Content { get; set; }
    }

    public class SmsVM
    {
        [Required]
        public IEnumerable<string> To { get; set; }

        [Required]
        public string Text { get; set; }

        public int? EventInfoId { get; set; }
    }

    public class EmailVM
    {
        [Required]
        public IEnumerable<EmailRecipientVM> To { get; set; }

        [Required]
        public string Subject { get; set; }

        [Required]
        public string Message { get; set; }

        public int EventInfoId { get; set; } // TODO: Remove this?
    }

    public class EmailRecipientVM
    {
        [Required]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}