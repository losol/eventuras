using System.ComponentModel.DataAnnotations;

namespace Eventuras.WebApi.Controllers.v4.Notifications
{
    public class SmsRecipientListAttribute : ValidationAttribute
    {
        public string GetErrorMessage(string address) =>
            $"Recipient list must contain valid phone numbers only, but {address} was given";

        protected override ValidationResult IsValid(object value,
            ValidationContext validationContext)
        {
            if (value == null)
            {
                return ValidationResult.Success;
            }

            var phoneNumberValidator = new PhoneAttribute();

            var phoneNumbers = (string[])value;
            foreach (var phoneNumber in phoneNumbers)
            {
                if (!phoneNumberValidator.IsValid(phoneNumber))
                {
                    return new ValidationResult(GetErrorMessage(phoneNumber));
                }
            }

            return ValidationResult.Success;
        }
    }
}
