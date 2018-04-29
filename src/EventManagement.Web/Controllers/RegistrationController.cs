using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using losol.EventManagement.Domain;
using losol.EventManagement.Web.Services;
using Microsoft.AspNetCore.Authorization;
using losol.EventManagement.Services.Messaging;
using losol.EventManagement.ViewModels;
using losol.EventManagement.Web.ViewModels;
using losol.EventManagement.Services;
using System.IO;

namespace EventManagement.Web.Controllers
{
    [Authorize (Policy = "AdministratorRole")]
    [Route("registration")]
    public class RegistrationController : Controller
    {
        [HttpGet("{id}")]
        public async Task<IActionResult> ViewRegistration(
            [FromRoute]int id,
            [FromServices] IRegistrationService registrationService)

        {
            var registration = await registrationService.GetWithEventInfoAndOrders(id);

            var eventRegistration = new EventRegistration {
                EventInfo = registration.EventInfo,
                Orders = registration.Orders,
                Email = registration.User.Email
            };

            eventRegistration.VerificationUrl = Url.Page(
					pageName: "/Events/Register/Confirm", 
					pageHandler: null, 
					values: new {
						id = registration.RegistrationId,
						auth = registration.VerificationCode
					},
					protocol: Request.Scheme
				);

            eventRegistration.EventUrl = Url.Page(
					pageName: "/Events/Details", 
					pageHandler: null, 
					values: new {
						id = registration.EventInfoId
					},
					protocol: Request.Scheme
				);
	
            return View("Templates/Email/Registration", eventRegistration);
        }

    } 
}
