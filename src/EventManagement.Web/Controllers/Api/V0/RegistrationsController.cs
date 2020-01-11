using losol.EventManagement.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using static losol.EventManagement.Domain.PaymentMethod;
using static losol.EventManagement.Domain.Registration;

namespace losol.EventManagement.Web.Controllers.Api.V0
{
    [ApiVersion("0")]
    [Authorize(Policy = AuthPolicies.AdministratorRole)]
    [Route("/api/v0/registrations")]
    public class RegistrationsController : Controller
    {
        private readonly IRegistrationService _registrationsService;
        private readonly IOrderService _orderService;

        public RegistrationsController(IRegistrationService registrationsService, IOrderService orderService)
        {
            _registrationsService = registrationsService;
            _orderService = orderService;
        }

        [HttpPost("{id}/participant/update")]
        public async Task<ActionResult> UpdateParticipantInfo([FromRoute] int id, [FromBody] ParticipantInfoVM vm)
        {
            if (!ModelState.IsValid) return BadRequest();
            try
            {
                await _registrationsService.UpdateParticipantInfo(
                    id,
                    vm.ParticipantName,
                    vm.ParticipantJobTitle,
                    vm.ParticipantCity,
                    vm.ParticipantEmployer);
            }
            catch (ArgumentException)
            {
                return BadRequest();
            }
            return Ok();
        }

        [HttpPost("{id}/certificatecomment/update")]
        public async Task<ActionResult> UpdateCertificateComment([FromRoute] int id, [FromBody] CertificateCommentVM vm)
        {
            if (!ModelState.IsValid) return BadRequest();
            try
            {
                await _registrationsService.UpdateCertificateComment(
                    id,
                    vm.CertificateComment);
            }
            catch (ArgumentException)
            {
                return BadRequest();
            }
            return Ok();
        }

        [HttpPost("{id}/customer/update")]
        public async Task<ActionResult> UpdateCustomerInfo([FromRoute] int id, [FromBody] CustomerInfoVM vm)
        {
            if (!ModelState.IsValid) return BadRequest();
            try
            {
                await _registrationsService.UpdateCustomerInfo(
                    id,
                    vm.CustomerName,
                    vm.CustomerEmail,
                    vm.CustomerVatNumber,
                    vm.CustomerInvoiceReference);

                await _registrationsService.UpdateCustomerAddress(
                    id,
                    vm.CustomerAddress,
                    vm.CustomerCity,
                    vm.CustomerZip,
                    vm.CustomerCountry);
            }
            catch (ArgumentException)
            {
                return BadRequest();
            }
            return Ok();
        }

        [HttpPost("{id}/paymentmethod/update/{paymentmethod}")]
        public async Task<ActionResult> SetPaymentMethod([FromRoute] int id, [FromRoute] PaymentProvider paymentmethod)
        {
            if (!ModelState.IsValid) return BadRequest();
            try
            {
                await _registrationsService.UpdatePaymentMethod(
                    id,
                    paymentmethod);
            }
            catch (ArgumentException)
            {
                return BadRequest();
            }
            return Ok();
        }

        [HttpPost("status/update/{id}/{status}")]
        public async Task<ActionResult> UpdateRegistrationStatus([FromRoute] int id, [FromRoute] RegistrationStatus status)
        {
            var cancelled = "";
            try
            {
                await _registrationsService.UpdateRegistrationStatus(id, status);

                // TODO Move to services project?
                if (status == RegistrationStatus.Cancelled)
                {
                    var registration = await _registrationsService.GetWithOrdersAsync(id);
                    foreach (var order in registration.Orders)
                    {
                        await _orderService.MarkAsCancelledAsync(order.OrderId);
                        cancelled += $" Ordre {order.OrderId} er kansellert. ";
                    }
                }
                return Ok("Registreringen slettet. " + cancelled);
            }
            catch (Exception e) when (e is InvalidOperationException || e is ArgumentException)
            {
                return BadRequest();
            }
        }

        [HttpPost("type/update/{id}/{type}")]
        public async Task<ActionResult> UpdateRegistrationType([FromRoute] int id, [FromRoute] RegistrationType type)
        {
            try
            {
                await _registrationsService.UpdateRegistrationType(id, type);
                return Ok();
            }
            catch (Exception e) when (e is InvalidOperationException || e is ArgumentException)
            {
                return BadRequest();
            }
        }

        public class CertificateCommentVM
        {
            public string CertificateComment { get; set; }
        }

        public class ParticipantInfoVM
        {
            public string ParticipantName { get; set; }
            public string ParticipantJobTitle { get; set; }
            public string ParticipantCity { get; set; }
            public string ParticipantEmployer { get; set; }
        }

        public class CustomerInfoVM
        {
            public string CustomerName { get; set; }
            public string CustomerEmail { get; set; }
            public string CustomerVatNumber { get; set; }
            public string CustomerInvoiceReference { get; set; }

            public string CustomerAddress { get; set; }
            public string CustomerZip { get; set; }
            public string CustomerCity { get; set; }
            public string CustomerCountry { get; set; }
        }

    }
}