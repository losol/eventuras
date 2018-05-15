using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using GoApi.Core;
using losol.EventManagement.Services;
using losol.EventManagement.Services.Messaging.Sms;
using losol.EventManagement.ViewModels;
using losol.EventManagement.Web.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace losol.EventManagement.Web.Controllers.Api {
    [Authorize (Policy = "AdministratorRole")]
    [Route ("/api/v0/messaging")]
    public class MessagingController : Controller {
        private readonly StandardEmailSender _emailSender;
        private readonly ISmsSender _smsSender;
        private readonly IRegistrationService _registrationService;
        private readonly IMessageLogService _messageLog;

        public MessagingController (
            StandardEmailSender emailSender,
            ISmsSender smsSender,
            IRegistrationService registrationService,
            IMessageLogService messageLog) {
            _emailSender = emailSender;
            _smsSender = smsSender;
            _messageLog = messageLog;
            _registrationService = registrationService;
        }

        [HttpPost ("email/participants-at-event/{id}")]
        public async Task<IActionResult> EmailAll ([FromRoute] int eventInfoId, [FromBody] EmailContent content) {
            if (!ModelState.IsValid) return BadRequest ();
            var recipients = "";
            var errors = "";
            var registrations = await _registrationService.GetRegistrations (eventInfoId);

            foreach (var reg in registrations) {
                try {
                    await _emailSender.SendStandardEmailAsync (
                        new EmailMessage {
                            Name = reg.ParticipantName,
                                Email = reg.User.Email,
                                Subject = content.Subject,
                                Message = content.Message
                        }
                    );
                    recipients += $@"""{reg.User.Name}"" <{reg.User.Email}>; ";
                } catch (Exception exc) {
                    errors += exc.Message + Environment.NewLine;
                }
            }

            var result = "";
            if (errors == "") {
                result = "Alle epost sendt!";
            } else {
                result = "Sendte epost. Men fikk noen feil: " + Environment.NewLine + errors;
            }
            
            await _messageLog.AddAsync (eventInfoId, recipients, content.Message, "Email", "SendGrid", result);

            return Ok (result.Replace (Environment.NewLine, "<br />"));
        }

        [HttpPost ("email")]
        public async Task<IActionResult> SendEmail ([FromBody] EmailVM vm) {
            if (!ModelState.IsValid) return BadRequest ();
            var errors = "";
            var emailTasks = vm.To.Select (r => _emailSender.SendStandardEmailAsync (
                new EmailMessage {
                    Name = r.Name,
                        Email = r.Email,
                        Subject = vm.Subject,
                        Message = vm.Message
                }));
            try {
                await Task.WhenAll (emailTasks);
            } catch (Exception exc) {
                errors += exc.Message + Environment.NewLine;
            }

            var result = "";
            if (errors == "") {
                result = "Alle SMS sendt!";
            } else {
                result = "Sendte SMS. Men fikk noen feil: " + Environment.NewLine + errors;
            }
            
          
            return Ok (result.Replace (Environment.NewLine, "<br />"));
        }

        [HttpPost ("sms")]
        public async Task<IActionResult> SendSms ([FromBody] SmsVM vm) {
            if (!ModelState.IsValid) return BadRequest ();
            var smsTasks = vm.To.Select (t => _smsSender.SendSmsAsync (t, vm.Text));
            var errors = "";
            try {
                await Task.WhenAll (smsTasks);
            } catch (Exception exc) {
                errors += exc.Message + Environment.NewLine;
            }
            var result = "";
            if (errors == "") {
                result = "Alle SMS sendt!";
            } else {
                result = "Sendte SMS. Men fikk noen feil: " + Environment.NewLine + errors;
            }

            await _messageLog.AddAsync (vm.EventInfoId, string.Join (";", vm.To), vm.Text, "SMS", "Twilio", result);

            return Ok (result.Replace (Environment.NewLine, "<br />"));
        }

        public class EmailContent {
            public string Subject { get; set; }
            public string Message { get; set; }
        }

        public class SmsVM {
            [Required]
            public IEnumerable<string> To { get; set; }

            [Required]
            public string Text { get; set; }
            public int EventInfoId { get; set; }
        }

        public class EmailVM {
            [Required]
            public IEnumerable<EmailRecipientVM> To { get; set; }

            [Required]
            public string Subject { get; set; }

            [Required]
            public string Message { get; set; }
            public int EventInfoId { get; set; }
        }

        public class EmailRecipientVM {
            [Required]
            public string Name { get; set; }

            [Required, EmailAddress]
            public string Email { get; set; }
        }
    }
}