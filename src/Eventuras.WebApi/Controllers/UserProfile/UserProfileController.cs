using Eventuras.WebApi.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace Eventuras.WebApi.Controllers.UserProfile
{
    // andy: as for me it's not needed at all. JWT can be decoded on the client side.

    [ApiController]
    public class UserProfileController : ControllerBase
    {
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
    }
}