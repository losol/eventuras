using Microsoft.AspNetCore.Razor.TagHelpers;
using static Eventuras.Domain.Order;

namespace Eventuras.Web.TagHelpers;

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
                badgeClass = new TagHelperAttribute("class", "badge badge-light");
                break;

            case OrderStatus.Invoiced:
                badgeClass = new TagHelperAttribute("class", "badge badge-success");
                break;

            case OrderStatus.Verified:
                badgeClass = new TagHelperAttribute("class", "badge badge-info");
                break;

            case OrderStatus.Cancelled:
                badgeClass = new TagHelperAttribute("class", "badge badge-warning");
                break;

            default:
                badgeClass = new TagHelperAttribute("class", "badge badge-secondary");
                break;
        }

        output.Attributes.SetAttribute(badgeClass);
    }
}