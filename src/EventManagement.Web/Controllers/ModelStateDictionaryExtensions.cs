using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.Linq;

namespace losol.EventManagement.Web.Controllers
{
    public static class ModelStateDictionaryExtensions
    {
        public static string FormatErrors(this ModelStateDictionary dictionary)
        {
            return string.Join("\r\n ", dictionary.Values
                .Where(v => v.Errors.Any())
                .SelectMany(v => v.Errors.Select(e => e.ErrorMessage)));
        }
    }
}
