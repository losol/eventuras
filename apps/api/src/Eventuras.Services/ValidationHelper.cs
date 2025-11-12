using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace Eventuras.Services;

public static class ValidationHelper
{
    /// <exception cref="ValidationException">Object is invalid</exception>
    public static void ValidateObject(object instance)
    {
        if (instance == null)
        {
            throw new ArgumentNullException(nameof(instance));
        }

        var results = new List<ValidationResult>();
        var context = new ValidationContext(instance, null, null);
        if (Validator.TryValidateObject(instance, context, results, true))
        {
            return;
        }

        var summary = string.Join(";\r\n ", results
            .Select(v => v.ErrorMessage));
        throw new ValidationException($"Validation failed: {summary}");
    }

    public static string GetValueIfEmpty(string field, string newValue) =>
        string.IsNullOrWhiteSpace(field) ? newValue : field;

    public static T GetValueIfDefault<T>(T field, T newValue) where T : struct =>
        EqualityComparer<T>.Default.Equals(field, default) ? newValue : field;
}
