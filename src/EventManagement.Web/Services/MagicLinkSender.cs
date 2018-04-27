using System.Threading.Tasks;
using losol.EventManagement.Services.Messaging;
using losol.EventManagement.Web.Config;
using losol.EventManagement.Web.ViewModels.Email;

namespace losol.EventManagement.Web.Services
{
    public sealed class MagicLinkSender : ApplicationEmailSender
    {
        private readonly Site _siteConfig;

        public MagicLinkSender(IEmailSender emailSender, IRenderService renderService,
         Site siteConfig) 
            : base(emailSender, renderService) 
        {
            this._siteConfig = siteConfig;
        }

        protected override string Template => "Templates/Email/MagicLinkEmail";
        
        public async Task SendAsync(string emailAddress)
        {
            await base.SendAsync(
                emailAddress: emailAddress, 
                subject: $"MagicLink to log into {_siteConfig.Title}",
                vm: new MagicLinkVM
                {
                    MagicLink = "https://google.com"
                }
            );
        }
    }
}
