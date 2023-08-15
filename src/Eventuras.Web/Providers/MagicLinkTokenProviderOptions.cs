using System;
using Microsoft.AspNetCore.Identity;

namespace Eventuras.Web.Providers;

public class MagicLinkTokenProviderOptions : DataProtectionTokenProviderOptions
{
    public MagicLinkTokenProviderOptions()
    {
        // update the defaults
        Name = "MagicLinkTokenProvider";
        TokenLifespan = TimeSpan.FromMinutes(10);
    }
}