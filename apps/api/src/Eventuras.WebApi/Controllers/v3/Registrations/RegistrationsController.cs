using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Asp.Versioning;
using Eventuras.Services.Auth;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Registrations;
using Eventuras.WebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Eventuras.WebApi.Controllers.v3.Registrations;

[ApiVersion("3")]
[Authorize]
[Route("v{version:apiVersion}/registrations")]
[ApiController]
public class RegistrationsController : ControllerBase
{
    private const string MimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    private readonly ILogger<RegistrationsController> _logger;
    private readonly IRegistrationExportService _registrationExportService;
    private readonly IRegistrationManagementService _registrationManagementService;
    private readonly IRegistrationRetrievalService _registrationRetrievalService;

    public RegistrationsController(
        IRegistrationRetrievalService registrationRetrievalService,
        IRegistrationManagementService registrationManagementService,
        IRegistrationExportService registrationExportService,
        ILogger<RegistrationsController> logger)
    {
        _registrationRetrievalService = registrationRetrievalService ?? throw
            new ArgumentNullException(nameof(registrationRetrievalService));

        _registrationManagementService = registrationManagementService ?? throw
            new ArgumentNullException(nameof(registrationManagementService));

        _registrationExportService = registrationExportService ?? throw
            new ArgumentNullException(nameof(registrationExportService));

        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }


    [HttpGet]
    [EndpointSummary("Get registrations with optional Excel export")]
    [EndpointDescription("Retrieves registrations with optional export to Excel based on the Accept header.")]
    [ProducesResponseType(typeof(PageResponseDto<RegistrationDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> GetRegistrations(
        [FromQuery] RegistrationsQueryDto query,
        CancellationToken cancellationToken = default
    )
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("GetRegistrations called with invalid query parameters: {query}", query);
            throw new BadHttpRequestException("Invalid query parameters.");
        }

        var registrationListRequest = new RegistrationListRequest
        {
            Limit = query.Limit,
            Offset = query.Offset,
            Filter = new RegistrationFilter
            {
                AccessibleOnly = true,
                EventInfoId = query.EventId,
                UserId = query.UserId
            },
            OrderBy = RegistrationListOrder.RegistrationTime,
            Descending = true
        };

        // Check for Excel export based on Accept header
        if (Request.Headers.TryGetValue("Accept", out var accept) && accept.Contains(MimeType))
        {
            _logger.LogDebug("GetRegistrations called with Excel export request.");

            // Only admins can export to Excel
            if (!User.IsAdmin())
            {
                return Forbid();
            }

            var stream = new MemoryStream();
            await _registrationExportService.ExportParticipantListToExcelAsync(
                stream,
                registrationListRequest
            );
            return new FileContentResult(stream.ToArray(), MimeType) { FileDownloadName = "Registrations.xlsx" };
        }

        // Default to a paginated response
        var paging = await _registrationRetrievalService
            .ListRegistrationsAsync(
                registrationListRequest,
                RetrievalOptions(query),
                cancellationToken
            );

        var response = await PageResponseDto<RegistrationDto>.FromPagingAsync(
            query,
            paging,
            async r =>
            {
                var products = query.IncludeProducts
                    ? await _registrationRetrievalService.GetRegistrationProductsAsync(r, cancellationToken)
                    : null;
                return new RegistrationDto(r, products);
            },
            cancellationToken
        );

        return Ok(response);
    }


    [HttpGet("{id}")]
    public async Task<ActionResult<RegistrationDto>> GetRegistrationById(int id,
        [FromQuery] RegistrationsQueryDto query, CancellationToken cancellationToken)
    {
        var registration =
            await _registrationRetrievalService.GetRegistrationByIdAsync(id, RetrievalOptions(query),
                cancellationToken);
        if (registration == null)
        {
            return NotFound("Registration not found.");
        }

        var products = query.IncludeProducts
            ? await _registrationRetrievalService.GetRegistrationProductsAsync(registration, cancellationToken)
            : null;

        return new RegistrationDto(registration, products);
    }


    [HttpPost]
    public async Task<ActionResult<RegistrationDto>> CreateNewRegistration(
        [FromBody] NewRegistrationDto dto,
        CancellationToken cancellationToken)
    {
        var registration = await _registrationManagementService.CreateRegistrationAsync(dto.EventId, dto.UserId!.Value,
            new RegistrationOptions
            {
                CreateOrder = dto.CreateOrder,
                Verified = true,
                SendWelcomeLetter = dto.SendWelcomeLetter
            }, cancellationToken);

        if (!dto.Empty)
        {
            dto.CopyTo(registration);
            await _registrationManagementService.UpdateRegistrationAsync(registration, cancellationToken);
        }

        return new RegistrationDto(registration);
    }


    /// <summary>
    ///     Alias for POST /v3/registrations
    /// </summary>
    [HttpPost("me/{eventId}")]
    public async Task<ActionResult<RegistrationDto>> RegisterSelf(
        int eventId, [FromQuery(Name = "createOrder")] bool createOrder)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("RegisterSelf called with invalid eventId: {eventId}", eventId);
            return BadRequest("Invalid eventId.");
        }


        var registration = await _registrationManagementService.CreateRegistrationAsync(eventId, User.GetUserId() ?? throw new NotAccessibleException("User ID not found."),
            new RegistrationOptions { CreateOrder = createOrder });

        return new RegistrationDto(registration);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<RegistrationDto>> UpdateRegistration(int id,
        [FromBody] RegistrationUpdateDto dto,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var registration = await _registrationRetrievalService.GetRegistrationByIdAsync(id, null, cancellationToken);

        if (registration == null)
        {
            return NotFound("Registration not found.");
        }

        dto.CopyTo(registration);

        await _registrationManagementService.UpdateRegistrationAsync(registration, cancellationToken);

        return new RegistrationDto(registration);
    }


    [HttpPatch("{id}")]
    [EndpointSummary("Partially update a registration")]
    [EndpointDescription("Updates specific fields of a registration using JSON Merge Patch semantics. Settable fields: Status, Type, Notes, PaymentMethod, CertificateComment, CustomerVatNumber, CustomerInvoiceReference. Fields omitted from the body are untouched; string fields set to null clear the corresponding value.")]
    [ProducesResponseType(typeof(RegistrationDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> PatchRegistration(
        int id,
        [FromBody] RegistrationPatchDto patchDto,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var registration = await _registrationRetrievalService.GetRegistrationByIdAsync(id, null, cancellationToken);
        if (registration == null)
        {
            return NotFound("Registration not found.");
        }

        patchDto.ApplyTo(registration);

        // UpdateRegistrationAsync now owns audit-event emission for status/type
        // deltas — the controller doesn't need to track before/after itself.
        await _registrationManagementService.UpdateRegistrationAsync(registration, cancellationToken);

        var updatedDto = new RegistrationDto(registration);
        return Ok(updatedDto);
    }


    [HttpDelete("{id}")]
    public async Task<IActionResult> CancelRegistration(int id, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("CancelRegistration called with invalid registration ID: {id}", id);
            return BadRequest("Invalid registration ID.");
        }

        // NotFoundException bubbles to HttpResponseExceptionFilter, which
        // maps it to 404. No local try/catch needed.
        await _registrationManagementService.CancelRegistrationAsync(id, cancellationToken);
        return Ok();
    }


    private static RegistrationRetrievalOptions RetrievalOptions(RegistrationsQueryDto query)
    {
        if (query == null)
        {
            return new RegistrationRetrievalOptions();
        }

        return new RegistrationRetrievalOptions
        {
            LoadUser = query.IncludeUserInfo,
            LoadEventInfo = query.IncludeEventInfo,
            LoadProducts = query.IncludeProducts,
            LoadOrders = query.IncludeOrders
        };
    }
}
