using Microsoft.AspNetCore.Razor.TagHelpers;

namespace Eventuras.TagHelpers;

public class GoogleTagBodyTagHelper : TagHelper
{
    // Usage: <google-tag-body gtm-id="GTM-XXXXXX" />

    public string GtmId { get; set; }

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        output.SuppressOutput();

        if (!string.IsNullOrEmpty(GtmId))
        {
            var bodytag = @"
						<!-- Google Tag Manager (noscript) -->
						<noscript><iframe src='https://www.googletagmanager.com/ns.html?id=***GTM-ID***'
						height='0' width='0' style='display:none;visibility:hidden'></iframe></noscript>
						<!-- End Google Tag Manager (noscript) -->".Replace("***GTM-ID***", GtmId);

            output.Content.SetHtmlContent(bodytag);
        }
    }
}