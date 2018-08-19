using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Razor.Runtime.TagHelpers;
using Microsoft.AspNetCore.Razor.TagHelpers;
using static losol.EventManagement.Domain.EventInfo;

namespace losol.EventManagement.Web.TagHelpers
{
	[HtmlTargetElement("event-status", TagStructure = TagStructure.WithoutEndTag)]
	public class EventStatusTagHelper : TagHelper
	{
		public EventInfoStatus Value { get; set; }

		public override void Process(TagHelperContext context, TagHelperOutput output)
		{
			output.TagMode = TagMode.StartTagAndEndTag;
			output.TagName = "span";
			output.Content.SetContent(Value.ToString());

			TagHelperAttribute badgeClass;
			switch (Value)
			{
				case EventInfoStatus.Planned:
					badgeClass = new TagHelperAttribute("class", "badge badge-info");
					break;
				case EventInfoStatus.RegistrationsOpen:
					badgeClass = new TagHelperAttribute("class", "badge badge-success");
					break;
				case EventInfoStatus.RegistrationsClosed:
					badgeClass = new TagHelperAttribute("class", "badge badge-warning");
					break;
				case EventInfoStatus.WaitingList:
					badgeClass = new TagHelperAttribute("class", "badge badge-warning");
					break;
				case EventInfoStatus.Cancelled:
					badgeClass = new TagHelperAttribute("class", "badge badge-danger");
					break;
				default:
					badgeClass = new TagHelperAttribute("class", "badge badge-secondary");
					break;
			}

			output.Attributes.SetAttribute(badgeClass);
		}
	}
}
