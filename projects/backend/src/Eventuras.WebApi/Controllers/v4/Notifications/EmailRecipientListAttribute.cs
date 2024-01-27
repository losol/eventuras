using Losol.Communication.Email;
using System;
using System.ComponentModel.DataAnnotations;

namespace Eventuras.WebApi.Controllers.v4.Notifications
{
    public class EmailRecipientListAttribute : ValidationAttribute
    {
        public string GetErrorMessage(string address) =>
            $"Recipient list must contain valid email addresses only, but {address} was given";

        protected override ValidationResult IsValid(object value,
            ValidationContext validationContext)
        {
            if (value == null)
            {
                return ValidationResult.Success;
            }
            var addresses = (string[])value;
            foreach (var address in addresses)
            {
                if (!CheckAddress(address))
                {
                    return new ValidationResult(GetErrorMessage(address));
                }
            }
            return ValidationResult.Success;
        }

        private static bool CheckAddress(string address)
        {
            try
            {
                var parsedAddress = new Address(address);
                return !string.IsNullOrEmpty(parsedAddress.Email);
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}
