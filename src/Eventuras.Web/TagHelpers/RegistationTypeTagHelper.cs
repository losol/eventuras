using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Razor.Runtime.TagHelpers;
using Microsoft.AspNetCore.Razor.TagHelpers;
using static Eventuras.Domain.Order;
using static Eventuras.Domain.Registration;

namespace Eventuras.Web.TagHelpers
{
    [HtmlTargetElement("registration-type", TagStructure = TagStructure.WithoutEndTag)]
    public class RegistationTypeTagHelper : TagHelper
    {
        public RegistrationType Value { get; set; }

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            output.TagMode = TagMode.StartTagAndEndTag;
            output.TagName = "span";
            output.Content.SetContent(Value.ToString());

            TagHelperAttribute badgeClass;
            switch (Value)
            {
                case RegistrationType.Participant:
                    badgeClass = new TagHelperAttribute("class", "badge badge-light");
                    break;
                case RegistrationType.Staff:
                    badgeClass = new TagHelperAttribute("class", "badge badge-warning");
                    break;
                case RegistrationType.Student:
                    badgeClass = new TagHelperAttribute("class", "badge badge-info");
                    break;
                case RegistrationType.Lecturer:
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
