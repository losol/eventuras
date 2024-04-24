using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Eventuras.Domain;

namespace Eventuras.Services.Registrations;

public class ExportColumnConfig
{
    // Column header
    public string Header { get; set; }
    // Data extractor function
    public Func<Registration, string> DataExtractor { get; set; }

    public static List<ExportColumnConfig> GetDefaultConfig()
    {
        return new List<ExportColumnConfig>
        {
            new ExportColumnConfig
            {
                Header = "RegistrationId",
                DataExtractor = reg => reg.RegistrationId.ToString()
            },
            new ExportColumnConfig
            {
                Header = "User.FirstName",
                DataExtractor = reg => reg.User?.GivenName ?? ""
            },
            new ExportColumnConfig
            {
                Header = "User.MiddleName",
                DataExtractor = reg => reg.User?.MiddleName ?? ""
            },
            new ExportColumnConfig
            {
                Header = "User.LastName",
                DataExtractor = reg => reg.User?.FamilyName ?? ""
            },
            new ExportColumnConfig
            {
                Header = "User.FullName",
                DataExtractor = reg => reg.User?.Name ?? ""
            },
            new ExportColumnConfig
            {
                Header = "User.Email",
                DataExtractor = reg => reg.User?.Email ?? ""
            },
            new ExportColumnConfig
            {
                Header = "User.Phone",
                DataExtractor = reg => reg.User?.PhoneNumber ?? ""
            },
            new ExportColumnConfig
            {
                Header = "User.ProfessionalIdentityNumber",
                DataExtractor = reg => reg.User?.ProfessionalIdentityNumber ?? ""
            },
            new ExportColumnConfig
            {
                Header = "EventName",
                DataExtractor = reg => reg.EventInfo.Title
            },
            new ExportColumnConfig
            {
                Header = "Products",
                DataExtractor = reg => string.Join(", ", reg.Products.Select(p =>
                {
                    var sb = new StringBuilder();
                    if (p.Quantity > 1)
                    {
                        sb.Append($"{p.Quantity} × {p.Product.Name}");
                    }
                    else
                    {
                        sb.Append(p.Product.Name);
                    }
                    if (p.Variant != null)
                    {
                        sb.Append($" ({p.Variant.Name})");
                    }
                    return sb.ToString();
                }))
            },
            new ExportColumnConfig
            {
                Header = "RegistrationStatus",
                DataExtractor = reg => reg.Status.ToString()
            },
            new ExportColumnConfig
            {
                Header = "RegistrationType",
                DataExtractor = reg => reg.Type.ToString()
            },
            new ExportColumnConfig
            {
                Header = "Registration.Notes",
                DataExtractor = reg => reg.Notes?.ToString()
            }
        };
    }
}
