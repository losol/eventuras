using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Eventuras.Web.Providers;

public class MagicLinkTokenProvider<TUser> : DataProtectorTokenProvider<TUser> where TUser : class
{
    public MagicLinkTokenProvider(
        IDataProtectionProvider dataProtectionProvider,
        IOptions<MagicLinkTokenProviderOptions> options,
        ILogger<MagicLinkTokenProvider<TUser>> logger) : base(dataProtectionProvider, options, logger) { }
}