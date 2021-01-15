
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services;
using Eventuras.Services.Registrations;
using Eventuras.WebApi.Auth;
using Eventuras.WebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Eventuras.WebApi.Controllers.UserProfile
{
    public class UserInfo
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("claims")]
        public Dictionary<string, string> Claims { get; set; }
    }

    [ApiController]
    public class UserProfileController : ControllerBase
    {
        private readonly IRegistrationRetrievalService _registrationService;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger _logger;

        public UserProfileController(IRegistrationRetrievalService registrationService, UserManager<ApplicationUser> userManager, ILogger<UserProfileController> logger)
        {
            _registrationService = registrationService;
            _userManager = userManager;
            _logger = logger;
        }


        [HttpGet]
        [Authorize]
        [ApiVersion("3")]
        [Route("v{version:apiVersion}/userprofile/claims")]
        public UserInfo GetUserClaims()
        {
            return new UserInfo()
            {
                Id = this.User.GetId(),
                Claims = this.User.Claims.ToDictionary(claim => claim.Type, claim => claim.Value)
            };
        }


        [HttpGet]
        [Authorize]
        [ApiVersion("3")]
        [Route("v{version:apiVersion}/userprofile/registrations")]
        public async Task<ActionResult<List<RegistrationDto>>> GetUserRegistrations()
        {
            // TODO: add new user if user does not exist?
            // TODO: get the email?
            var user = await _userManager.GetUserAsync(HttpContext.User);
            var token = new CancellationToken();
            var registrations = await _registrationService.ListRegistrationsAsync(
                    new IRegistrationRetrievalService.Request
                    {
                        UserId = user.Id,
                        IncludingUser = true,
                        IncludingEventInfo = true,
                        IncludingOrders = true,
                        IncludingProducts = true,
                        OrderBy = IRegistrationRetrievalService.Order.RegistrationTime,
                        Descending = true
                    }, token);

            return Ok(registrations);
        }
    }
}