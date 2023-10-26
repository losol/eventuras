using Asp.Versioning;
using Eventuras.Services;
using Eventuras.Services.Organizations;
using Eventuras.Services.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace Eventuras.WebApi.Controllers.Organizations
{
    [ApiVersion("3")]
    [Authorize(Policy = Constants.Auth.AdministratorRole)]
    [Route("v{version:apiVersion}/organizations/{organizationId:int}/members/{userId}")]
    [ApiController]
    public class OrganizationMembersController : ControllerBase
    {
        private readonly IUserRetrievalService _userRetrievalService;
        private readonly IOrganizationRetrievalService _orgRetrievalService;
        private readonly IOrganizationMemberManagementService _orgMemberService;

        public OrganizationMembersController(
            IOrganizationMemberManagementService orgMemberService,
            IUserRetrievalService userRetrievalService,
            IOrganizationRetrievalService orgRetrievalService)
        {
            _orgMemberService = orgMemberService ?? throw
                new ArgumentNullException(nameof(orgMemberService));
            _userRetrievalService = userRetrievalService ?? throw
                new ArgumentNullException(nameof(userRetrievalService));
            _orgRetrievalService = orgRetrievalService ?? throw
                new ArgumentNullException(nameof(orgRetrievalService));
        }

        [HttpPut]
        [Authorize(Roles = Roles.SystemAdmin)]
        public async Task<IActionResult> Put(int organizationId, string userId)
        {
            var user = await _userRetrievalService.GetUserByIdAsync(userId);
            var org = await _orgRetrievalService.GetOrganizationByIdAsync(organizationId);
            await _orgMemberService.AddToOrganizationAsync(user, org);
            return Ok();
        }

        [HttpDelete]
        [Authorize(Roles = Roles.SystemAdmin)]
        public async Task Delete(int organizationId, string userId)
        {
            var user = await _userRetrievalService.GetUserByIdAsync(userId);
            var org = await _orgRetrievalService.GetOrganizationByIdAsync(organizationId);
            await _orgMemberService.RemoveFromOrganizationAsync(user, org);
        }
    }
}
