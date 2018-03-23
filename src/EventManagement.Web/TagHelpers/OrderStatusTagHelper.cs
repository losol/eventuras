using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Razor.Runtime.TagHelpers;
using Microsoft.AspNetCore.Razor.TagHelpers;
using static losol.EventManagement.Domain.Order;

namespace losol.EventManagement.Web.TagHelpers
{
	[HtmlTargetElement("order-status", TagStructure = TagStructure.WithoutEndTag)]
	public class OrderStatusTagHelper : TagHelper
	{
		public OrderStatus Value { get; set; }

		public override void Process(TagHelperContext context, TagHelperOutput output)
		{
			output.TagMode = TagMode.StartTagAndEndTag;
			output.TagName = "span";
			output.Content.SetContent(Value.ToString());

			TagHelperAttribute badgeClass;
			switch (Value)
			{
				case OrderStatus.Draft:
				case OrderStatus.Invoiced:
					badgeClass = new TagHelperAttribute("class", "badge badge-light");
					break;
				case OrderStatus.Verified:
					badgeClass = new TagHelperAttribute("class", "badge badge-info");
					break;
				case OrderStatus.Paid:
					badgeClass = new TagHelperAttribute("class", "badge badge-success");
					break;
				default:
					badgeClass = new TagHelperAttribute("class", "badge badge-secondary");
					break;
			}

			output.Attributes.SetAttribute(badgeClass);
		}
	}
}
