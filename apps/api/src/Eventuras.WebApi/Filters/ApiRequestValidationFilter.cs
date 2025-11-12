using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.Extensions.Logging;

namespace Eventuras.WebApi.Filters;

public class ValidationFilter : IAsyncActionFilter
{
    private readonly ILogger<ValidationFilter> _logger;
    private readonly ProblemDetailsFactory _problemDetailsFactory;

    public ValidationFilter(ProblemDetailsFactory problemDetailsFactory, ILogger<ValidationFilter> logger)
    {
        _problemDetailsFactory = problemDetailsFactory;
        _logger = logger;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        if (!context.ModelState.IsValid)
        {
            var errors = context.ModelState
                .Where(x => x.Value.Errors.Any())
                .SelectMany(x => x.Value.Errors.Select(e => new { Field = x.Key, Error = e.ErrorMessage }))
                .ToList();

            var problemDetails = _problemDetailsFactory.CreateValidationProblemDetails(
                context.HttpContext,
                context.ModelState,
                StatusCodes.Status400BadRequest,
                "Validation Error",
                detail: "One or more validation errors occurred."
            );

            problemDetails.Extensions["errors"] = errors;

            _logger.LogWarning("Validation errors occurred: {Errors}", errors);

            context.Result = new BadRequestObjectResult(problemDetails);
            return;
        }

        await next();
    }
}
