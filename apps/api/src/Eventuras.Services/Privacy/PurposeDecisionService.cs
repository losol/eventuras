#nullable enable

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Eventuras.Domain;
using Eventuras.Infrastructure;
using Eventuras.Services.Auth;
using Eventuras.Services.BusinessEvents;
using Eventuras.Services.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Eventuras.Services.Privacy;

internal class PurposeDecisionService : IPurposeDecisionService
{
    // Where a decision was made, stored on the decision for later audit.
    private const string UserProfileSource = "userprofile";

    private readonly IBusinessEventService _businessEvents;
    private readonly ApplicationDbContext _dbContext;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public PurposeDecisionService(
        ApplicationDbContext dbContext,
        IBusinessEventService businessEvents,
        IHttpContextAccessor httpContextAccessor)
    {
        ArgumentNullException.ThrowIfNull(dbContext);
        ArgumentNullException.ThrowIfNull(businessEvents);
        ArgumentNullException.ThrowIfNull(httpContextAccessor);

        _dbContext = dbContext;
        _businessEvents = businessEvents;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<IReadOnlyList<MyPurpose>> ListMineAsync(
        Organization organization,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(organization);

        var userId = RequireUserId();

        // Every version, not only current ones: whether a consent still counts depends
        // on whether a later version was a material change.
        var versions = await _dbContext.ProcessingPurposes
            .AsNoTracking()
            .Where(p => p.OrganizationUuid == organization.Uuid)
            .ToListAsync(cancellationToken);

        var decisions = await _dbContext.PurposeDecisions
            .AsNoTracking()
            .Where(d => d.UserId == userId
                        && d.OrganizationUuid == organization.Uuid
                        && d.RegistrationUuid == null)
            .ToDictionaryAsync(d => d.Code, cancellationToken);

        return versions
            .GroupBy(v => v.Code)
            .Select(g => (Versions: (IReadOnlyCollection<ProcessingPurpose>)g.ToList(),
                Current: PurposeEvaluation.CurrentVersion(g.ToList())))
            .Where(p => p.Current is not null)
            .OrderBy(p => p.Current!.Code, StringComparer.Ordinal)
            .Select(p =>
            {
                var decision = decisions.GetValueOrDefault(p.Current!.Code);
                return new MyPurpose(p.Current, decision, PurposeEvaluation.Evaluate(p.Versions, decision));
            })
            .ToList();
    }

    public async Task<MyPurpose> DecideAsync(
        Organization organization,
        string code,
        PurposeDecision.DecisionValue decision,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(organization);
        ArgumentException.ThrowIfNullOrWhiteSpace(code);

        var userId = RequireUserId();

        var versions = await _dbContext.ProcessingPurposes
            .AsNoTracking()
            .Where(p => p.OrganizationUuid == organization.Uuid && p.Code == code)
            .ToListAsync(cancellationToken);

        // Unknown and retired purposes alike: there is nothing current to decide on.
        var current = PurposeEvaluation.CurrentVersion(versions)
                      ?? throw new NotFoundException($"The organization has no current purpose '{code}'.");

        var entity = await _dbContext.PurposeDecisions
            .SingleOrDefaultAsync(d => d.UserId == userId
                                       && d.OrganizationUuid == organization.Uuid
                                       && d.Code == code
                                       && d.RegistrationUuid == null,
                cancellationToken);

        var previous = entity?.Decision;
        var previousVersionUuid = entity?.ProcessingPurposeUuid;
        var now = SystemClock.Instance.GetCurrentInstant();

        if (entity is null)
        {
            entity = new PurposeDecision
            {
                UserId = userId,
                OrganizationUuid = organization.Uuid,
                Code = code,
                ProcessingPurposeUuid = current.Uuid,
                Decision = decision,
                Source = UserProfileSource,
                CreatedAt = now,
                DecidedAt = now
            };
            _dbContext.PurposeDecisions.Add(entity);
        }
        else
        {
            entity.ProcessingPurposeUuid = current.Uuid;
            entity.Decision = decision;
            entity.Source = UserProfileSource;
            entity.DecidedAt = now;
        }

        // Repeating the same answer on the same version changes nothing worth an audit row.
        if (previous != decision || previousVersionUuid != current.Uuid)
        {
            _businessEvents.AddEvent(
                BusinessEventSubjects.ForUser(userId),
                "purpose.decision.changed",
                $"{(decision == PurposeDecision.DecisionValue.Allowed ? "Allowed" : "Denied")} '{code}' (version {current.Version}).",
                organization.Uuid,
                actorUserUuid: userId,
                metadata: new
                {
                    Code = code,
                    current.Version,
                    Decision = decision.ToString(),
                    Previous = previous?.ToString(),
                    Source = UserProfileSource
                });
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return new MyPurpose(current, entity, PurposeEvaluation.Evaluate(versions, entity));
    }

    private Guid RequireUserId() =>
        _httpContextAccessor.HttpContext?.User.GetUserId()
        ?? throw new NotAccessibleException("Only a known, signed-in user can see or change their own decisions.");
}
