using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace Losol.Communication.Email;

public class CheckChildrenAttribute : ValidationAttribute
{
    protected override ValidationResult IsValid(object value, ValidationContext validationContext)
    {
        if (value == null)
        {
            return ValidationResult.Success;
        }

        if (!(value is IEnumerable list))
        {
            var results = new List<ValidationResult>();
            if (!Validator.TryValidateObject(value, new ValidationContext(value, null, null), results, true))
            {
                return new CollectionValidationResult
                {
                    ErrorMessage = $@"Error occured at {validationContext.DisplayName}",
                    NestedResults = results
                };
            }
        }
        else
        {
            var nestedResultList = (from object item in list
                                    let results = new List<ValidationResult>()
                                    let context = new ValidationContext(item, validationContext, null)
                                    where !Validator.TryValidateObject(item, context, results, true)
                                    select new CollectionValidationResult { ErrorMessage = $@"Error occured at {validationContext.DisplayName}", NestedResults = results })
                .Cast<ValidationResult>()
                .ToList();

            if (nestedResultList.Any())
            {
                return new CollectionValidationResult
                {
                    ErrorMessage = $"Error occured at {validationContext.DisplayName}",
                    NestedResults = nestedResultList
                };
            }
            ;
        }

        return ValidationResult.Success;
    }

    public class CollectionValidationResult : ValidationResult
    {
        public CollectionValidationResult() : base("")
        {

        }
        public IList<ValidationResult> NestedResults { get; set; }
    }
}
