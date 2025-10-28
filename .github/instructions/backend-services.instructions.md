---
applyTo: "apps/api/src/**/*.cs"
---

# Backend Service Guidelines for C# API

When creating or modifying backend services in `apps/api`, follow these guidelines to ensure consistency, maintainability, and adherence to clean architecture principles.

## Architecture Overview

### Layered Structure

```
apps/api/src/
├── Eventuras.WebApi/           # API layer (controllers, middleware)
├── Eventuras.Services/         # Business logic layer
├── Eventuras.Domain/           # Domain models and interfaces
├── Eventuras.Infrastructure/   # Data access, external services
└── Eventuras.Services.*/       # Feature-specific service modules
```

### Key Principles

- **Controllers**: Thin, handle HTTP concerns only
- **Services**: Contain business logic, orchestrate operations
- **Domain**: Core business entities and rules
- **Infrastructure**: Database, external APIs, file storage

## Coding Standards

### Naming Conventions

```csharp
// Classes and Methods: PascalCase
public class EventRegistrationService { }
public async Task<Event> CreateEventAsync() { }

// Private fields: _camelCase
private readonly IEventRepository _eventRepository;
private readonly ILogger<EventRegistrationService> _logger;

// Interfaces: I + PascalCase
public interface IEventService { }
public interface IEmailSender { }

// Properties: PascalCase
public string EventTitle { get; set; }
public int MaxParticipants { get; set; }
```

### Async/Await Best Practices

```csharp
// ✅ Good - async all the way
public async Task<Event> CreateEventAsync(EventDto dto, CancellationToken cancellationToken)
{
    var eventEntity = new Event { Title = dto.Title };
    await _repository.AddAsync(eventEntity, cancellationToken);
    await _repository.SaveChangesAsync(cancellationToken);
    return eventEntity;
}

// ❌ Avoid - blocking on async code
public Event CreateEvent(EventDto dto)
{
    var eventEntity = new Event { Title = dto.Title };
    _repository.AddAsync(eventEntity).Wait(); // Don't do this!
    return eventEntity;
}
```

### Dependency Injection

```csharp
// ✅ Good - constructor injection
public class EventRegistrationService : IEventRegistrationService
{
    private readonly IEventRepository _eventRepository;
    private readonly IEmailSender _emailSender;
    private readonly ILogger<EventRegistrationService> _logger;

    public EventRegistrationService(
        IEventRepository eventRepository,
        IEmailSender emailSender,
        ILogger<EventRegistrationService> logger)
    {
        _eventRepository = eventRepository ?? throw new ArgumentNullException(nameof(eventRepository));
        _emailSender = emailSender ?? throw new ArgumentNullException(nameof(emailSender));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }
}

// Register in Startup.cs or Program.cs
services.AddScoped<IEventRegistrationService, EventRegistrationService>();
```

## Controller Best Practices

### Keep Controllers Thin

```csharp
// ✅ Good - delegates to service
[ApiController]
[Route("api/v3/events")]
public class EventsController : ControllerBase
{
    private readonly IEventService _eventService;

    public EventsController(IEventService eventService)
    {
        _eventService = eventService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(EventDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateEvent(
        [FromBody] CreateEventDto dto,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _eventService.CreateEventAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetEvent), new { id = result.Id }, result);
    }
}

// ❌ Avoid - business logic in controller
[HttpPost]
public async Task<IActionResult> CreateEvent([FromBody] CreateEventDto dto)
{
    // Don't put business logic here!
    var eventEntity = new Event
    {
        Title = dto.Title,
        StartDate = dto.StartDate,
        // ... complex validation and business rules
    };

    await _context.Events.AddAsync(eventEntity);
    await _context.SaveChangesAsync();

    // ... send emails, update caches, etc.
    return Ok(eventEntity);
}
```

### HTTP Status Codes

```csharp
// Use appropriate status codes
return Ok(data);                           // 200
return CreatedAtAction(...);               // 201
return NoContent();                        // 204
return BadRequest(ModelState);             // 400
return Unauthorized();                     // 401
return Forbidden();                        // 403
return NotFound();                         // 404
return Conflict("Resource already exists"); // 409
return StatusCode(500, "Internal error");  // 500
```

### API Attributes

```csharp
[ApiController]
[Route("api/v3/[controller]")]
[Authorize] // Require authentication
public class EventsController : ControllerBase
{
    /// <summary>
    /// Retrieves an event by its unique identifier.
    /// </summary>
    /// <param name="id">The event ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The event details.</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(EventDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetEvent(
        int id,
        CancellationToken cancellationToken)
    {
        var eventDto = await _eventService.GetEventByIdAsync(id, cancellationToken);
        if (eventDto == null)
        {
            return NotFound();
        }
        return Ok(eventDto);
    }
}
```

## Service Layer Best Practices

### Service Interface and Implementation

```csharp
// Interface
public interface IEventService
{
    Task<EventDto> GetEventByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<EventDto> CreateEventAsync(CreateEventDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteEventAsync(int id, CancellationToken cancellationToken = default);
}

// Implementation
public class EventService : IEventService
{
    private readonly IEventRepository _repository;
    private readonly ILogger<EventService> _logger;

    public EventService(IEventRepository repository, ILogger<EventService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<EventDto> GetEventByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Fetching event with ID {EventId}", id);

        var eventEntity = await _repository.GetByIdAsync(id, cancellationToken);
        if (eventEntity == null)
        {
            _logger.LogWarning("Event with ID {EventId} not found", id);
            return null;
        }

        return MapToDto(eventEntity);
    }
}
```

### Exception Handling

```csharp
// ✅ Good - specific exceptions with context
public async Task<Event> CreateEventAsync(CreateEventDto dto, CancellationToken cancellationToken)
{
    if (string.IsNullOrWhiteSpace(dto.Title))
    {
        throw new ValidationException("Event title is required");
    }

    var existingEvent = await _repository.FindByTitleAsync(dto.Title, cancellationToken);
    if (existingEvent != null)
    {
        throw new DuplicateEventException($"Event with title '{dto.Title}' already exists");
    }

    try
    {
        var eventEntity = MapToEntity(dto);
        await _repository.AddAsync(eventEntity, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return eventEntity;
    }
    catch (DbUpdateException ex)
    {
        _logger.LogError(ex, "Database error while creating event");
        throw new DataAccessException("Failed to create event due to database error", ex);
    }
}

// ❌ Avoid - swallowing exceptions
try
{
    await _repository.SaveChangesAsync();
}
catch (Exception)
{
    // Silent failure - don't do this!
    return null;
}
```

## Data Access with Entity Framework

### Repository Pattern

```csharp
public interface IEventRepository
{
    Task<Event> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Event>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Event entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Event entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

public class EventRepository : IEventRepository
{
    private readonly ApplicationDbContext _context;

    public EventRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Event> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Events
            .Include(e => e.EventInfo)
            .FirstOrDefaultAsync(e => e.EventId == id, cancellationToken);
    }

    public async Task<IEnumerable<Event>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Events
            .Where(e => !e.Archived)
            .OrderBy(e => e.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Event entity, CancellationToken cancellationToken = default)
    {
        await _context.Events.AddAsync(entity, cancellationToken);
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }
}
```

### Efficient Queries

```csharp
// ✅ Good - efficient, selective loading
public async Task<EventDto> GetEventDetailsAsync(int id)
{
    return await _context.Events
        .Where(e => e.EventId == id)
        .Select(e => new EventDto
        {
            Id = e.EventId,
            Title = e.EventInfo.Title,
            Description = e.EventInfo.Description,
            StartDate = e.StartDate
        })
        .FirstOrDefaultAsync();
}

// ❌ Avoid - loading entire entity when you need only a few fields
public async Task<EventDto> GetEventDetailsAsync(int id)
{
    var eventEntity = await _context.Events
        .Include(e => e.EventInfo)
        .Include(e => e.Registrations)
        .Include(e => e.Products)
        .FirstOrDefaultAsync(e => e.EventId == id);

    // Loading way more data than needed
    return new EventDto { Id = eventEntity.EventId, Title = eventEntity.EventInfo.Title };
}
```

## Validation

### Use Data Annotations

```csharp
public class CreateEventDto
{
    [Required(ErrorMessage = "Event title is required")]
    [StringLength(200, MinimumLength = 3)]
    public string Title { get; set; }

    [Required]
    [StringLength(2000)]
    public string Description { get; set; }

    [Required]
    [DataType(DataType.Date)]
    [FutureDate(ErrorMessage = "Event date must be in the future")]
    public DateTime StartDate { get; set; }

    [Range(1, 1000, ErrorMessage = "Max participants must be between 1 and 1000")]
    public int MaxParticipants { get; set; }
}
```

### FluentValidation (Alternative)

```csharp
public class CreateEventDtoValidator : AbstractValidator<CreateEventDto>
{
    public CreateEventDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Event title is required")
            .Length(3, 200).WithMessage("Title must be between 3 and 200 characters");

        RuleFor(x => x.StartDate)
            .GreaterThan(DateTime.UtcNow).WithMessage("Event date must be in the future");

        RuleFor(x => x.MaxParticipants)
            .InclusiveBetween(1, 1000).WithMessage("Max participants must be between 1 and 1000");
    }
}
```

## Logging

### Structured Logging

```csharp
public class EventService : IEventService
{
    private readonly ILogger<EventService> _logger;

    public async Task<Event> CreateEventAsync(CreateEventDto dto, CancellationToken cancellationToken)
    {
        // ✅ Good - structured logging with context
        _logger.LogInformation(
            "Creating event with title {EventTitle} starting on {StartDate}",
            dto.Title,
            dto.StartDate);

        try
        {
            var eventEntity = MapToEntity(dto);
            await _repository.AddAsync(eventEntity, cancellationToken);
            await _repository.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Successfully created event {EventId} with title {EventTitle}",
                eventEntity.EventId,
                eventEntity.EventInfo.Title);

            return eventEntity;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to create event with title {EventTitle}",
                dto.Title);
            throw;
        }
    }

    // ❌ Avoid - string interpolation in logs
    _logger.LogInformation($"Creating event: {dto.Title}"); // Don't do this!
}
```

### Log Levels

- `LogDebug`: Development/debugging information
- `LogInformation`: Normal operations, key business events
- `LogWarning`: Recoverable issues, unexpected behavior
- `LogError`: Errors that need attention
- `LogCritical`: Critical failures requiring immediate action

## Testing

### Unit Tests with xUnit

```csharp
public class EventServiceTests
{
    private readonly Mock<IEventRepository> _repositoryMock;
    private readonly Mock<ILogger<EventService>> _loggerMock;
    private readonly EventService _service;

    public EventServiceTests()
    {
        _repositoryMock = new Mock<IEventRepository>();
        _loggerMock = new Mock<ILogger<EventService>>();
        _service = new EventService(_repositoryMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task CreateEventAsync_WithValidDto_ShouldCreateEvent()
    {
        // Arrange
        var dto = new CreateEventDto
        {
            Title = "Test Event",
            Description = "Test Description",
            StartDate = DateTime.UtcNow.AddDays(7)
        };

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Event>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _repositoryMock
            .Setup(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _service.CreateEventAsync(dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Test Event", result.EventInfo.Title);
        _repositoryMock.Verify(r => r.AddAsync(It.IsAny<Event>(), It.IsAny<CancellationToken>()), Times.Once);
        _repositoryMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetEventByIdAsync_WhenEventNotFound_ShouldReturnNull()
    {
        // Arrange
        _repositoryMock
            .Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Event)null);

        // Act
        var result = await _service.GetEventByIdAsync(999);

        // Assert
        Assert.Null(result);
    }
}
```

### Integration Tests

```csharp
public class EventsControllerIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public EventsControllerIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateEvent_WithValidData_ShouldReturn201()
    {
        // Arrange
        var dto = new CreateEventDto
        {
            Title = "Integration Test Event",
            Description = "Test Description",
            StartDate = DateTime.UtcNow.AddDays(7)
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v3/events", dto);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var createdEvent = await response.Content.ReadFromJsonAsync<EventDto>();
        Assert.NotNull(createdEvent);
        Assert.Equal("Integration Test Event", createdEvent.Title);
    }
}
```

## Documentation

### XML Comments

```csharp
/// <summary>
/// Service for managing event registrations.
/// </summary>
public class EventRegistrationService : IEventRegistrationService
{
    /// <summary>
    /// Creates a new registration for an event.
    /// </summary>
    /// <param name="eventId">The ID of the event to register for.</param>
    /// <param name="userId">The ID of the user registering.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created registration.</returns>
    /// <exception cref="ValidationException">Thrown when validation fails.</exception>
    /// <exception cref="NotFoundException">Thrown when event or user not found.</exception>
    public async Task<Registration> CreateRegistrationAsync(
        int eventId,
        string userId,
        CancellationToken cancellationToken = default)
    {
        // Implementation
    }
}
```

## Configuration

### Options Pattern

```csharp
// Configuration class
public class EmailSettings
{
    public string SmtpServer { get; set; }
    public int SmtpPort { get; set; }
    public string FromAddress { get; set; }
}

// Register in Program.cs
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));

// Use in service
public class EmailService
{
    private readonly EmailSettings _settings;

    public EmailService(IOptions<EmailSettings> options)
    {
        _settings = options.Value;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        // Use _settings.SmtpServer, etc.
    }
}
```

## Checklist Before Committing

- [ ] Follows naming conventions (PascalCase for classes/methods, \_camelCase for fields)
- [ ] Uses async/await for all I/O operations
- [ ] Dependency injection used properly
- [ ] Controllers are thin, logic in services
- [ ] Proper exception handling with logging
- [ ] XML documentation on public APIs
- [ ] Unit tests written for business logic
- [ ] No hardcoded configuration values
- [ ] CancellationToken passed through async calls
- [ ] Structured logging with proper log levels

## Resources

- Project backend guidelines: `.ai/agents/backend-agent.md`
- ASP.NET Core Documentation: https://docs.microsoft.com/aspnet/core
- Entity Framework Core: https://docs.microsoft.com/ef/core
