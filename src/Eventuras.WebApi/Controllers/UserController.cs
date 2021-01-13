
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using Eventuras.WebApi.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers
{
    public class UserInfo
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("claims")]
        public Dictionary<string, string> Claims { get; set; }
    }

    [ApiController]
    [Route("/api/claims")]
    public class UserController : ControllerBase
    {
        [HttpGet]
        [Authorize]
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