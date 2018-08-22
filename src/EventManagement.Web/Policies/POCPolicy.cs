using System.Threading.Tasks;
using losol.EventManagement.Domain;
using losol.EventManagement.Web.Extensions;
using Microsoft.AspNetCore.Authorization;

namespace losol.EventManagement.Web.Policies
{
    public static class POCAuthorizationPolicyExtensions
    {
        public static void AddPOCPolicy(this AuthorizationOptions options)
        {
            options.AddPolicy("POCPolicy", policy =>
                {
                    policy.RequireAssertion(context =>
                        context.User.IsInRole("Admin") ||
                        context.User.IsInRole("SuperAdmin") ||
                        context.User.HasClaim(c =>
                            c.Type == CustomClaimTypes.IsStaff && c.Value == true.ToString())
                    );
                    policy.AddRequirements(new EventStaffRequirement());
                });
        }
    }

    public class EventInfoStaffAuthorizationHandler
                    : AuthorizationHandler<EventStaffRequirement, EventInfo>
    {
        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context,
                                                       EventStaffRequirement requirement,
                                                       EventInfo eventInfo)
        {
            if(context.User.HasClaim(c => c.Type == CustomClaimTypes.StaffEventId && c.Value == eventInfo.EventInfoId.ToString()))
            {
                context.Succeed(requirement);
            }

            return Task.CompletedTask;
        }
    }

    public class EventStaffRequirement : IAuthorizationRequirement { }
}
