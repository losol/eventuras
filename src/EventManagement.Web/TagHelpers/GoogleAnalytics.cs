using System;
using System.Text;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace losol.EventManagement.TagHelpers
{
	public class GoogleAnalyticsTagHelper : TagHelper
	{
		// Usage: <google-analytics tracking-id="UA-XXXXXXXX-X" />

		public string TrackingId { get; set; }

		public override void Process(TagHelperContext context, TagHelperOutput output)
		{
			output.SuppressOutput();

			if (!String.IsNullOrEmpty(TrackingId))
			{
				var uaTag = @"<!-- Global site tag (gtag.js) - Google Analytics -->
					<script async src='https://www.googletagmanager.com/gtag/js?id=***UA***'></script>
					<script>
					window.dataLayer = window.dataLayer || [];
					function gtag(){dataLayer.push(arguments);}
					gtag('js', new Date());

					gtag('config', '***UA***');
					</script>"
				.Replace("***UA***", TrackingId);

				output.Content.SetHtmlContent(uaTag.ToString());
			}
		}
	}
}