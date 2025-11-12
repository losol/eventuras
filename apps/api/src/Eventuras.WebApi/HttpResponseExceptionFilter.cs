#nullable enable

using System;
using Eventuras.Services.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.Extensions.Logging;

namespace Eventuras.WebApi;

public class HttpResponseExceptionFilter : IExceptionFilter
{
    private readonly ILogger<HttpResponseExceptionFilter> _logger;

    public HttpResponseExceptionFilter(ILogger<HttpResponseExceptionFilter> logger) => _logger = logger;

    public void OnException(ExceptionContext context)
    {
        var ex = context.Exception;
        _logger.LogDebug("Handling exception of type {ExceptionType}", ex.GetType());

        var result = (IActionResult?)(ex switch
        {
            NotImplementedException => new StatusCodeResult(StatusCodes.Status501NotImplemented),
            NotFoundException => new NotFoundObjectResult(ex.Message),
            InputException => new BadRequestObjectResult(ex.Message),
            NotSupportedException => new BadRequestObjectResult(ex.Message),
            NotAccessibleException => new ForbidResult(),
            OrgNotSpecifiedException => new BadRequestObjectResult(ex.Message),
            DuplicateException => new ConflictObjectResult(ex.Message),
            ArgumentServiceException argEx => new BadRequestObjectResult(CreateBadRequestModel(argEx.Message,
                argEx.ParamName)),
            InvalidOperationServiceException invEx => new BadRequestObjectResult(CreateBadRequestModel(invEx.Message)),
            _ => null
        });

        if (result is null)
        {
            context.ExceptionHandled = false;
            _logger.LogError(ex, "Exception of type {ExceptionType} was not handled: {ExceptionMessage}", ex.GetType(),
                ex.Message);
        }
        else
        {
            context.ExceptionHandled = true;
            context.Result = result;
            _logger.LogWarning("Exception of type {ExceptionType} was handled, resulted in: {@Result}", ex.GetType(),
                result);
        }
    }

    private static ValidationProblemDetails CreateBadRequestModel(string message, string? paramName = null)
    {
        var modelState = new ModelStateDictionary();
        modelState.AddModelError(paramName ?? string.Empty, message);

        return new ValidationProblemDetails(modelState);
    }
}
