using System;
using Microsoft.AspNetCore.Identity;

namespace losol.EventManagement.Web.Providers
{
    public class MagicLinkTokenProviderOptions : DataProtectionTokenProviderOptions  
    {
        public MagicLinkTokenProviderOptions()
        {
            // update the defaults
            Name = "MagicLinkTokenProvider";
            TokenLifespan = TimeSpan.FromMinutes(30);
        }
    }
}
