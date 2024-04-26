using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Spreadsheet;
using Eventuras.Domain;

namespace Eventuras.Services.Registrations.ExportService;

public enum ExcelColumnType
{
    String,
    Number,
    Date,
    Boolean,
}

public class ColumnConfig
{
    public string Header { get; set; }
    public Func<Registration, string> DataExtractor { get; set; }
    public ExcelColumnType ColumnType { get; set; } = ExcelColumnType.String;


    public static List<ColumnConfig> GetDefaultConfig()
    {
        return new List<ColumnConfig>
        {
            new ColumnConfig
            {
                Header = "RegistrationId",
                DataExtractor = reg => reg.RegistrationId.ToString(),
                ColumnType = ExcelColumnType.Number
            },
            new ColumnConfig
            {
                Header = "UserFirstName",
                DataExtractor = reg => reg.User?.GivenName ?? ""
            },
            new ColumnConfig
            {
                Header = "UserMiddleName",
                DataExtractor = reg => reg.User?.MiddleName ?? ""
            },
            new ColumnConfig
            {
                Header = "UserLastName",
                DataExtractor = reg => reg.User?.FamilyName ?? ""
            },
            new ColumnConfig
            {
                Header = "UserFullName",
                DataExtractor = reg => reg.User?.Name ?? ""
            },
            new ColumnConfig
            {
                Header = "UserEmail",
                DataExtractor = reg => reg.User?.Email ?? ""
            },
            new ColumnConfig
            {
                Header = "UserPhone",
                DataExtractor = reg => reg.User?.PhoneNumber ?? ""
            },
            new ColumnConfig
            {
                Header = "UserWorkId",
                DataExtractor = reg => reg.User?.ProfessionalIdentityNumber ?? "",
                ColumnType = ExcelColumnType.Number
            },
            new ColumnConfig
            {
                Header = "EventName",
                DataExtractor = reg => reg.EventInfo.Title
            },
            new ColumnConfig
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
            new ColumnConfig
            {
                Header = "RegistrationStatus",
                DataExtractor = reg => reg.Status.ToString()
            },
            new ColumnConfig
            {
                Header = "RegistrationType",
                DataExtractor = reg => reg.Type.ToString()
            },
            new ColumnConfig
            {
                Header = "RegistrationNotes",
                DataExtractor = reg => reg.Notes?.ToString()
            }
        };
    }

}
