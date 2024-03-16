using System;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Linq;
using System.Net.Mail;
using Eventuras.Services.Organizations.Settings;

namespace Eventuras.WebApi.Controllers.v3.Organizations;

public class OrganizationSettingValueAttribute : ValidationAttribute
{
    protected override ValidationResult IsValid(object value, ValidationContext validationContext)
    {
        var service = (IOrganizationSettingsRegistry)validationContext
            .GetService(typeof(IOrganizationSettingsRegistry));

        var dto = value as OrganizationSettingValueDto;
        if (!string.IsNullOrEmpty(dto?.Value))
        {
            var setting = service?.GetEntries().FirstOrDefault(e => e.Name == dto.Name);
            if (setting != null)
            {
                switch (setting.Type)
                {
                    case OrganizationSettingType.Number:
                        if (!double.TryParse(dto.Value, CultureInfo.InvariantCulture, out _))
                        {
                            return new ValidationResult(
                                $"Invalid value for {dto.Name}: {dto.Value} (number expected)");
                        }

                        break;

                    case OrganizationSettingType.Url:
                        if (!Uri.TryCreate(dto.Value, UriKind.Absolute, out _))
                        {
                            return new ValidationResult(
                                $"Invalid value for {dto.Name}: {dto.Value} (URL expected)");
                        }

                        break;

                    case OrganizationSettingType.Email:
                        if (!MailAddress.TryCreate(dto.Value, out _))
                        {
                            return new ValidationResult(
                                $"Invalid value for {dto.Name}: {dto.Value} (email address expected)");
                        }

                        break;

                    case OrganizationSettingType.Boolean:
                        if (!bool.TryParse(dto.Value, out _))
                        {
                            return new ValidationResult(
                                $"Invalid value for {dto.Name}: {dto.Value} (boolean true/false expected)");
                        }

                        break;
                }
            }
        }


        return ValidationResult.Success;
    }
}
