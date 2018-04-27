using losol.EventManagement.Web.Providers;
using Microsoft.AspNetCore.Identity;

namespace losol.EventManagement.Web.Extensions
{
    public static class IdentityBuilderExtensions  
    {
        public static IdentityBuilder AddMagicLinkTokenProvider(this IdentityBuilder builder)
        {
            var userType = builder.UserType;
            var provider= typeof(MagicLinkTokenProvider<>).MakeGenericType(userType);
            return builder.AddTokenProvider("MagicLinkTokenProvider", provider);
        }
    }
}