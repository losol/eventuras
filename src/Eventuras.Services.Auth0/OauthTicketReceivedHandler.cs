using Eventuras.Domain;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Eventuras.Services.Auth0
{
    /// <summary>
    /// Create Identity user after Auth0 Sign in if needed
    /// and fill in claims in HTTP context.
    /// </summary>
    internal class OauthTicketReceivedHandler : IOauthTicketReceivedHandler
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IOptions<Auth0IntegrationSettings> _options;

        public OauthTicketReceivedHandler(
            UserManager<ApplicationUser> userManager,
            IOptions<Auth0IntegrationSettings> options)
        {
            _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
            _options = options ?? throw new ArgumentNullException(nameof(options));
        }

        public async Task TicketReceivedAsync(TicketReceivedContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException(nameof(context));
            }

            var principal = context.Principal;
            var email = principal.GetRequiredClaim(ClaimTypes.Email);
            var role = principal.GetOptionalClaim(_options.Value.RoleClaimType);
            var name = principal.GetName();

            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                user = new ApplicationUser
                {
                    UserName = email,
                    Name = name,
                    Email = email
                };
                await _userManager.CreateAsync(user);
            }

            var claims = principal.GetAllClaimsExcept(
                ClaimTypes.NameIdentifier,
                ClaimTypes.Name,
                ClaimTypes.Role
                ).ToList();

            claims.Add(new Claim(ClaimTypes.NameIdentifier, user.Id));
            claims.Add(new Claim(ClaimTypes.Name, name));

            if (!string.IsNullOrEmpty(role))
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            context.Principal = new ClaimsPrincipal(new ClaimsIdentity(claims, principal.Identity.AuthenticationType));
        }
    }
}
