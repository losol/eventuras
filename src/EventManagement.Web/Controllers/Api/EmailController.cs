using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using losol.EventManagement.Services;
using losol.EventManagement.Web.Services;
using losol.EventManagement.ViewModels;

namespace losol.EventManagement.Web.Controllers.Api
{
    [Authorize]
	[Route("/api/v0/email")]
	public class EmailController : Controller
	{
		private readonly StandardEmailSender _emailSender;

		public EmailController(StandardEmailSender emailSender)
		{
			_emailSender = emailSender;
		}

		[HttpPost("send")]
		public async Task<IActionResult> SendEmail([FromBody]EmailVM vm) 
		{
			if (!ModelState.IsValid) return BadRequest();
            var emailTasks = vm.To.Select(r => _emailSender.SendAsync(
                new EmailMessage
                {
                    Name = r.Name,
                    Email = r.Email,
                    Subject = vm.Subject,
                    Message = vm.Message
                })
            );
            await Task.WhenAll(emailTasks);
			return Ok();
		}

		public class EmailVM
		{
            public IEnumerable<EmailRecipientVM> To { get; set; }
            public string Subject { get; set; }
            public string Message { get; set; }
		}

        public class EmailRecipientVM
        {
            public string Name { get; set; }
            public string Email { get; set; }
        }
	}
}
