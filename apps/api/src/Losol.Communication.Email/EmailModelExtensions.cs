using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace Losol.Communication.Email;

public static class EmailModelExtensions
{
    /// <param name="model">Model to validate. Not <code>null</code>.</param>
    /// <exception cref="ValidationException">When model is invalid</exception>
    public static void Validate(this EmailModel model)
    {
        if (model == null)
        {
            throw new ArgumentNullException(nameof(model));
        }

        var context = new ValidationContext(model, null, null);
        var results = new List<ValidationResult>();
        var isValid = Validator.TryValidateObject(model, context, results, true);
        if (!isValid)
        {
            throw new ValidationException("Model is not valid because " +
                                          string.Join(", ", results.Select(s => s.ErrorMessage).ToArray()));
        }

        if (string.IsNullOrEmpty(model.TextBody) &&
            string.IsNullOrEmpty(model.HtmlBody))
        {
            throw new ValidationException("Either text body or HTML body should present");
        }
    }
}
