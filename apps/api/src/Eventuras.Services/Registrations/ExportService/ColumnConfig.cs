using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Eventuras.Domain;

namespace Eventuras.Services.Registrations.ExportService;

public enum ExcelColumnType
{
    String,
    Number,
    Date,
    Boolean
}

public class ColumnConfig
{
    public string Header { get; set; }
    public Func<Registration, string> DataExtractor { get; set; }
    public ExcelColumnType ColumnType { get; set; } = ExcelColumnType.String;


    public static List<ColumnConfig> GetDefaultConfig() =>
        new()
        {
            new ColumnConfig
            {
                Header = "RegistrationId",
                DataExtractor = reg => reg.RegistrationId.ToString(),
                ColumnType = ExcelColumnType.Number
            },
            new ColumnConfig { Header = "FirstName", DataExtractor = reg => reg.User?.GivenName ?? "" },
            new ColumnConfig { Header = "MiddleName", DataExtractor = reg => reg.User?.MiddleName ?? "" },
            new ColumnConfig { Header = "LastName", DataExtractor = reg => reg.User?.FamilyName ?? "" },
            new ColumnConfig { Header = "FullName", DataExtractor = reg => reg.User?.Name ?? "" },

            // Join address fields into a single string, skip null or empty values
            new ColumnConfig
            {
                Header = "Address",
                DataExtractor = reg =>
                {
                    var addressParts = new List<string>();
                    if (!string.IsNullOrEmpty(reg.User?.AddressLine1))
                    {
                        addressParts.Add(reg.User.AddressLine1);
                    }

                    if (!string.IsNullOrEmpty(reg.User?.AddressLine2))
                    {
                        addressParts.Add(reg.User.AddressLine2);
                    }

                    if (!string.IsNullOrEmpty(reg.User?.ZipCode))
                    {
                        addressParts.Add(reg.User.ZipCode);
                    }

                    if (!string.IsNullOrEmpty(reg.User?.City))
                    {
                        addressParts.Add(reg.User.City);
                    }

                    if (!string.IsNullOrEmpty(reg.User?.Country))
                    {
                        addressParts.Add(reg.User.Country);
                    }

                    return string.Join(", ", addressParts);
                }
            },
            //BirthDate
            new ColumnConfig
            {
                Header = "BirthDate",
                DataExtractor = reg => reg.User.BirthDate?.ToString("yyyy-MM-dd") ?? "",
                ColumnType = ExcelColumnType.Date
            },
            // BirthDateVerified
            new ColumnConfig
            {
                Header = "BirthDateVerified",
                DataExtractor = reg => reg.User?.BirthDateVerified.ToString() ?? "",
                ColumnType = ExcelColumnType.Boolean
            },
            new ColumnConfig { Header = "Email", DataExtractor = reg => reg.User?.Email ?? "" },
            new ColumnConfig { Header = "Phone", DataExtractor = reg => reg.User?.PhoneNumber ?? "" },
            new ColumnConfig
            {
                Header = "WorkIdentityNumber",
                DataExtractor = reg => reg.User?.ProfessionalIdentityNumber ?? "",
                ColumnType = ExcelColumnType.Number
            },
            //SupplementaryInformation
            new ColumnConfig
            {
                Header = "SupplementaryInformation",
                DataExtractor = reg => reg.User?.SupplementaryInformation ?? "",
                ColumnType = ExcelColumnType.String
            },
            new ColumnConfig { Header = "EventName", DataExtractor = reg => reg.EventInfo.Title },
            new ColumnConfig
            {
                Header = "Products", DataExtractor = reg => "" // Will be populated separately with product data
            },
            new ColumnConfig { Header = "RegistrationStatus", DataExtractor = reg => reg.Status.ToString() },
            new ColumnConfig { Header = "RegistrationType", DataExtractor = reg => reg.Type.ToString() },
            new ColumnConfig { Header = "RegistrationNotes", DataExtractor = reg => reg.Notes?.ToString() }
        };

    public static string FormatProducts(List<RegistrationProductDto> products)
    {
        if (products == null || !products.Any())
        {
            return "";
        }

        return string.Join(", ", products.Select(p =>
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

            if (p.ProductVariant != null)
            {
                sb.Append($" ({p.ProductVariant.Name})");
            }

            return sb.ToString();
        }));
    }
}
