using System;
using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Eventuras.WebApi.Controllers.v3;

[ApiVersion("3")]
[Authorize(Policy = Constants.Auth.AdministratorRole)]
[Route("v{version:apiVersion}/diagnostics")]
[ApiController]
[ApiExplorerSettings(IgnoreApi = true)]
public class DiagnosticsController : ControllerBase
{
    [HttpPost("error-test")]
    public IActionResult ErrorTest()
    {
        throw new InvalidOperationException("Test exception from diagnostics endpoint");
    }
}
