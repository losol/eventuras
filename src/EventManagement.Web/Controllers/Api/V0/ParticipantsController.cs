using losol.EventManagement.Services;
using losol.EventManagement.ViewModels;
using losol.EventManagement.Web.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static losol.EventManagement.Domain.Registration;

namespace losol.EventManagement.Web.Controllers.Api.V0
{
    [ApiVersion("0")]
    [Authorize(Policy = AuthPolicies.AdministratorRole)]
    [Route("api/participants")]
    public class ParticipantsController : Controller
    {

        private readonly IRegistrationService _registrationService;

        public ParticipantsController(IRegistrationService registrationService)
        {
            _registrationService = registrationService;
        }


        [HttpPost("order_emails/{eventId}")]
        public async Task<IActionResult> OrderEmails([FromRoute] int eventId, [FromServices] StandardEmailSender emailSender, [FromServices] IRegistrationService registrationService, [FromBody] EmailVm vm)
        {
            var registrations = await registrationService.GetRegistrationsWithOrders(eventId);
            var emailTasks = registrations.Select(r =>
            {
                var message = new EmailMessage
                {
                    Name = r.ParticipantName,
                    Email = r.User.Email,
                    Subject = vm.Subject,
                    Message = vm.Message
                };
                if (r.HasOrder)
                {
                    StringBuilder builder = new StringBuilder();
                    builder.AppendLine("<br>");
                    builder.AppendLine("<h4>Ordre</h4>");

                    r.Orders.ForEach(
                        (o) => o.OrderLines?.ForEach(
                            (line) => builder.AppendLine($"<br>{line.ProductName}")
                        )
                    );

                    message.Message += builder.ToString();
                }
                return emailSender.SendStandardEmailAsync(message);
            });
            await Task.WhenAll(emailTasks);
            return Ok();
        }

        [HttpPost("mark_as_attended/{id}")]
        public async Task<IActionResult> MarkAsAttended([FromRoute] int id)
        {
            await _registrationService.SetRegistrationAsAttended(id);
            return Ok();
        }

        [HttpPost("mark_as_notattended/{id}")]
        public async Task<IActionResult> MarkAsNotAttended([FromRoute] int id)
        {
            await _registrationService.SetRegistrationAsNotAttended(id);
            return Ok();
        }

        [HttpPost("mark_as_finished/{id}")]
        public async Task<IActionResult> MarkAsFinished([FromRoute] int id)
        {
            await _registrationService.UpdateRegistrationStatus(id, RegistrationStatus.Finished);
            return Ok();
        }

        public class EmailVm
        {
            public string Subject { get; set; }
            public string Message { get; set; }

        }
    }
}