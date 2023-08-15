using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Email;
using Eventuras.Web.Config;
using Eventuras.Web.ViewModels;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.Extensions.Localization;

namespace Eventuras.Web.Services;

public sealed class MagicLinkSender
{
    private readonly IUrlHelper _urlHelper;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly Site _siteConfig;
    private readonly IStringLocalizer<MagicLinkSender> _stringLocalizer;
    private readonly IApplicationEmailSender _applicationEmailSender;

    public MagicLinkSender(
        IUrlHelperFactory urlHelperFactory,
        IActionContextAccessor actionContextAccessor,
        UserManager<ApplicationUser> userManager,
        Site siteConfig,
        IStringLocalizer<MagicLinkSender> stringLocalizer,
        IApplicationEmailSender applicationEmailSender)
    {
        _urlHelper = urlHelperFactory.GetUrlHelper(actionContextAccessor.ActionContext);
        _userManager = userManager;
        _siteConfig = siteConfig;
        _stringLocalizer = stringLocalizer;
        _applicationEmailSender = applicationEmailSender;
    }

    private const string Template = "Templates/Email/MagicLinkEmail";

    public async Task SendMagicLinkAsync(ApplicationUser user)
    {
        await _userManager.UpdateSecurityStampAsync(user);

        var token = await _userManager.GenerateUserTokenAsync(user, "MagicLinkTokenProvider", "magic-link");

        var magiclink = _urlHelper.Link("MagicLinkRoute", new { userid = user.Id, token });

        await _applicationEmailSender.SendEmailWithTemplateAsync(Template,
            user.Email,
            _stringLocalizer["Login link {0}", _siteConfig.Title],
            new MagicLinkVM
            {
                MagicLink = magiclink,
            });
    }
}