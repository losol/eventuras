
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using Eventuras.WebApi.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

    public class UserController : ControllerBase
    {
        [HttpGet]
        [Authorize]
        [ApiVersion("1")]
        [Route("v{version:apiVersion}/userprofile/claims")]
        public UserInfo Get()
        {
            return new UserInfo()
            {
                Id = this.User.GetId(),
                Claims = this.User.Claims.ToDictionary(claim => claim.Type, claim => claim.Value)
            };
        }
    }
}