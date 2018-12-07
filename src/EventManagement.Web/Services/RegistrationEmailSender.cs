using System;
using System.Threading.Tasks;
using losol.EventManagement.Domain;
using losol.EventManagement.Services;
using losol.EventManagement.Services.Messaging;
using losol.EventManagement.ViewModels;
using losol.EventManagement.Web.Config;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Routing;
using static losol.EventManagement.Domain.Registration;

namespace losol.EventManagement.Web.Services
{
	public sealed class RegistrationEmailSender : ApplicationEmailSender
	{
		protected override string Template => "Templates/Email/Registration";
		private readonly IRegistrationService _registrationService;
		private readonly IRenderService _renderService;
		private readonly IUrlHelper _urlHelper;
        private readonly string _requestScheme;


		public RegistrationEmailSender(
                IEmailSender emailSender, 
                IRenderService renderService,
                IUrlHelperFactory urlHelperFactory,
                IActionContextAccessor actionContextAccessor,
				IRegistrationService registrationService) 
			: base(emailSender, renderService)
		{ 
			_registrationService = registrationService;
			_renderService = renderService;
            _urlHelper = urlHelperFactory.GetUrlHelper(actionContextAccessor.ActionContext);;
            _requestScheme = actionContextAccessor.ActionContext.HttpContext.Request.Scheme;
		}


		public async Task SendRegistrationAsync(string emailAddress, string subject, string message, int registrationId) {

			var registration = await _registrationService.GetWithUserAndEventInfoAndOrders(registrationId);

				var eventRegistration = new EventRegistration {
					ParticipantName = registration.ParticipantName,
					EventInfo = registration.EventInfo,
					Orders = registration.Orders,
					Email = registration.User.Email,
					Verified =  (registration.Status != RegistrationStatus.Draft) ? true : false,
					HasOrder = registration.Orders.Count > 0,
					Message = message
				};

				eventRegistration.VerificationUrl = _urlHelper.Page(
						pageName: "/Events/Register/Confirm", 
						pageHandler: null, 
						values: new {
							id = registration.RegistrationId,
							auth = registration.VerificationCode
						},
						protocol: _requestScheme
					);

				eventRegistration.EventUrl = _urlHelper.Page(
						pageName: "/Events/Details", 
						pageHandler: null, 
						values: new {
							id = registration.EventInfoId
						},
						protocol: _requestScheme
					);
					
				await SendAsync(emailAddress, subject, eventRegistration);
		}

	}
}