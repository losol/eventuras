
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
        private readonly IRegistrationRetrievalService _registrationRetrievalService;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger _logger;

        public UserProfileController(IRegistrationRetrievalService registrationRetrievalService, UserManager<ApplicationUser> userManager, ILogger<UserProfileController> logger)
        {
            _registrationRetrievalService = registrationRetrievalService;
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
        public async Task<ActionResult> GetUserRegistrations()
        {
            // TODO: add paging

            var userEmail = HttpContext.User.GetEmail();
            var user = await _userManager.FindByEmailAsync(userEmail);

            var reader = new PageReader<Registration>(async (offset, limit, token) =>
                            await _registrationRetrievalService.ListRegistrationsAsync(
                                new IRegistrationRetrievalService.Request
                                {
                                    UserId = user.Id,
                                    IncludingUser = false,
                                    IncludingEventInfo = false,
                                    IncludingOrders = false,
                                    IncludingProducts = false,
                                    OrderBy = IRegistrationRetrievalService.Order.RegistrationTime,
                                    Descending = true
                                }, token));

            // TODO: Read 10 registrations by defalt, and add pagination to this api
            return Ok();
        }
    }
}