using System;
using System.Text;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace losol.EventManagement.TagHelpers
{
	public class GoogleTagHeadTagHelper : TagHelper
	{
		// Usage: <google-tag-head gtm-id="GTM-XXXXXX" />

		public string GtmId { get; set; }

		public override void Process(TagHelperContext context, TagHelperOutput output)
		{
			output.SuppressOutput();

			if (!String.IsNullOrEmpty(GtmId))
			{
				var headtag = @"
					<!-- Google Tag Manager -->
					<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
					new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
					j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
					'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
					})(window,document,'script','dataLayer','***GTM***');</script>
					<!-- End Google Tag Manager -->"
					.Replace("***GTM***", GtmId);

				output.Content.SetHtmlContent(headtag);
			}
		}
	}
}