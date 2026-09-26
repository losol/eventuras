#nullable enable

using System;
using System.Collections.Generic;

using Eventuras.Domain;
using Eventuras.Services.Privacy;

using NodaTime;

using Xunit;

namespace Eventuras.Services.Tests.Privacy;

public class PurposeEvaluationTests
{
    private static readonly Guid OrganizationUuid = Guid.CreateVersion7();

    [Fact]
    public void Consent_Without_A_Decision_Is_Denied_And_Asked_For()
    {
        var versions = Versions(Current(ProcessingPurpose.PurposeKind.Consent, version: 1));

        var outcome = PurposeEvaluation.Evaluate(versions);

        AssertOutcome(outcome, PurposeStatus.Unanswered, mayProcess: false, mustAsk: true);
    }

    [Fact]
    public void Consent_Given_On_The_Current_Version_Is_Allowed()
    {
        var current = Current(ProcessingPurpose.PurposeKind.Consent, version: 1);
        var versions = Versions(current);

        var outcome = PurposeEvaluation.Evaluate(
            versions,
            organizationWide: DecisionOn(current, PurposeDecision.DecisionValue.Allowed));

        AssertOutcome(outcome, PurposeStatus.Allowed, mayProcess: true, mustAsk: false);
    }

    [Fact]
    public void Consent_Declined_Is_Denied_And_Not_Asked_Again()
    {
        var current = Current(ProcessingPurpose.PurposeKind.Consent, version: 1);
        var versions = Versions(current);

        var outcome = PurposeEvaluation.Evaluate(
            versions,
            organizationWide: DecisionOn(current, PurposeDecision.DecisionValue.Denied));

        AssertOutcome(outcome, PurposeStatus.Denied, mayProcess: false, mustAsk: false);
    }

    [Fact]
    public void Consent_Survives_A_Version_That_Is_Not_A_Material_Change()
    {
        var old = Retired(ProcessingPurpose.PurposeKind.Consent, version: 1);
        var current = Current(ProcessingPurpose.PurposeKind.Consent, version: 2);
        var versions = Versions(old, current);

        var outcome = PurposeEvaluation.Evaluate(
            versions,
            organizationWide: DecisionOn(old, PurposeDecision.DecisionValue.Allowed));

        AssertOutcome(outcome, PurposeStatus.Allowed, mayProcess: true, mustAsk: false);
    }

    [Fact]
    public void Consent_Given_Before_A_Material_Change_Expires()
    {
        var old = Retired(ProcessingPurpose.PurposeKind.Consent, version: 1);
        var current = Current(ProcessingPurpose.PurposeKind.Consent, version: 2, requiresReconsent: true);
        var versions = Versions(old, current);

        var outcome = PurposeEvaluation.Evaluate(
            versions,
            organizationWide: DecisionOn(old, PurposeDecision.DecisionValue.Allowed));

        AssertOutcome(outcome, PurposeStatus.Expired, mayProcess: false, mustAsk: true);
    }

    [Fact]
    public void Consent_Given_On_The_Material_Change_Itself_Still_Counts()
    {
        var old = Retired(ProcessingPurpose.PurposeKind.Consent, version: 1);
        var current = Current(ProcessingPurpose.PurposeKind.Consent, version: 2, requiresReconsent: true);
        var versions = Versions(old, current);

        var outcome = PurposeEvaluation.Evaluate(
            versions,
            organizationWide: DecisionOn(current, PurposeDecision.DecisionValue.Allowed));

        AssertOutcome(outcome, PurposeStatus.Allowed, mayProcess: true, mustAsk: false);
    }

    [Fact]
    public void Reservation_Without_A_Decision_Is_Allowed_And_Not_Asked_For()
    {
        var versions = Versions(Current(ProcessingPurpose.PurposeKind.Reservation, version: 1));

        var outcome = PurposeEvaluation.Evaluate(versions);

        AssertOutcome(outcome, PurposeStatus.Unanswered, mayProcess: true, mustAsk: false);
    }

    [Fact]
    public void Reservation_Against_The_Purpose_Is_Denied()
    {
        var current = Current(ProcessingPurpose.PurposeKind.Reservation, version: 1);
        var versions = Versions(current);

        var outcome = PurposeEvaluation.Evaluate(
            versions,
            organizationWide: DecisionOn(current, PurposeDecision.DecisionValue.Denied));

        AssertOutcome(outcome, PurposeStatus.Denied, mayProcess: false, mustAsk: false);
    }

    [Fact]
    public void Reservation_Outlives_A_Material_Change()
    {
        var old = Retired(ProcessingPurpose.PurposeKind.Reservation, version: 1);
        var current = Current(ProcessingPurpose.PurposeKind.Reservation, version: 2, requiresReconsent: true);
        var versions = Versions(old, current);

        var outcome = PurposeEvaluation.Evaluate(
            versions,
            organizationWide: DecisionOn(old, PurposeDecision.DecisionValue.Denied));

        AssertOutcome(outcome, PurposeStatus.Denied, mayProcess: false, mustAsk: false);
    }

    [Fact]
    public void Reservation_Lifted_Before_A_Material_Change_Does_Not_Expire()
    {
        var old = Retired(ProcessingPurpose.PurposeKind.Reservation, version: 1);
        var current = Current(ProcessingPurpose.PurposeKind.Reservation, version: 2, requiresReconsent: true);
        var versions = Versions(old, current);

        var outcome = PurposeEvaluation.Evaluate(
            versions,
            organizationWide: DecisionOn(old, PurposeDecision.DecisionValue.Allowed));

        AssertOutcome(outcome, PurposeStatus.Allowed, mayProcess: true, mustAsk: false);
    }

    [Fact]
    public void A_Retired_Purpose_Blocks_Processing_Without_Reporting_A_Decision()
    {
        var old = Retired(ProcessingPurpose.PurposeKind.Reservation, version: 1);
        var versions = Versions(old);

        var outcome = PurposeEvaluation.Evaluate(
            versions,
            organizationWide: DecisionOn(old, PurposeDecision.DecisionValue.Allowed));

        AssertOutcome(outcome, PurposeStatus.Retired, mayProcess: false, mustAsk: false);
    }

    [Fact]
    public void A_Registration_Decision_Overrides_An_Organization_Wide_Yes()
    {
        var current = Current(ProcessingPurpose.PurposeKind.Consent, version: 1);
        var versions = Versions(current);

        var outcome = PurposeEvaluation.Evaluate(
            versions,
            organizationWide: DecisionOn(current, PurposeDecision.DecisionValue.Allowed),
            forRegistration: DecisionOn(current, PurposeDecision.DecisionValue.Denied));

        AssertOutcome(outcome, PurposeStatus.Denied, mayProcess: false, mustAsk: false);
    }

    [Fact]
    public void A_Registration_Decision_Overrides_An_Organization_Wide_No()
    {
        var current = Current(ProcessingPurpose.PurposeKind.Consent, version: 1);
        var versions = Versions(current);

        var outcome = PurposeEvaluation.Evaluate(
            versions,
            organizationWide: DecisionOn(current, PurposeDecision.DecisionValue.Denied),
            forRegistration: DecisionOn(current, PurposeDecision.DecisionValue.Allowed));

        AssertOutcome(outcome, PurposeStatus.Allowed, mayProcess: true, mustAsk: false);
    }

    [Fact]
    public void An_Undefined_Purpose_Blocks_Processing_Without_Being_Asked_About()
    {
        var outcome = PurposeEvaluation.Evaluate(Versions());

        AssertOutcome(outcome, PurposeStatus.Undefined, mayProcess: false, mustAsk: false);
    }

    [Fact]
    public void Versions_Spanning_Two_Codes_Are_Rejected()
    {
        var versions = Versions(
            Current(ProcessingPurpose.PurposeKind.Consent, version: 1),
            Current(ProcessingPurpose.PurposeKind.Consent, version: 1, code: PurposeCodes.PublicListing));

        Assert.Throws<ArgumentException>(() => PurposeEvaluation.Evaluate(versions));
    }

    [Fact]
    public void Versions_Spanning_Two_Organizations_Are_Rejected()
    {
        var versions = Versions(
            Current(ProcessingPurpose.PurposeKind.Consent, version: 1),
            Current(ProcessingPurpose.PurposeKind.Consent, version: 1, organizationUuid: Guid.CreateVersion7()));

        Assert.Throws<ArgumentException>(() => PurposeEvaluation.Evaluate(versions));
    }

    [Fact]
    public void Versions_Disagreeing_On_Kind_Are_Rejected()
    {
        var versions = Versions(
            Retired(ProcessingPurpose.PurposeKind.Consent, version: 1),
            Current(ProcessingPurpose.PurposeKind.Reservation, version: 2));

        Assert.Throws<ArgumentException>(() => PurposeEvaluation.Evaluate(versions));
    }

    [Fact]
    public void Versions_With_A_Gap_Are_Rejected()
    {
        var versions = Versions(
            Retired(ProcessingPurpose.PurposeKind.Consent, version: 1),
            Current(ProcessingPurpose.PurposeKind.Consent, version: 3));

        Assert.Throws<ArgumentException>(() => PurposeEvaluation.Evaluate(versions));
    }

    [Fact]
    public void A_Current_Version_Behind_A_Retired_One_Is_Rejected()
    {
        var versions = Versions(
            Current(ProcessingPurpose.PurposeKind.Consent, version: 1),
            Retired(ProcessingPurpose.PurposeKind.Consent, version: 2));

        Assert.Throws<ArgumentException>(() => PurposeEvaluation.Evaluate(versions));
    }

    [Fact]
    public void Two_Unretired_Versions_Are_Rejected()
    {
        var versions = Versions(
            Current(ProcessingPurpose.PurposeKind.Consent, version: 1),
            Current(ProcessingPurpose.PurposeKind.Consent, version: 2));

        Assert.Throws<ArgumentException>(() => PurposeEvaluation.Evaluate(versions));
    }

    // Every kind and every answer, because a version the caller did not supply is
    // a broken input on all of them, not only where the version changes the answer.
    [Theory]
    [InlineData(ProcessingPurpose.PurposeKind.Consent, PurposeDecision.DecisionValue.Allowed)]
    [InlineData(ProcessingPurpose.PurposeKind.Consent, PurposeDecision.DecisionValue.Denied)]
    [InlineData(ProcessingPurpose.PurposeKind.Reservation, PurposeDecision.DecisionValue.Allowed)]
    [InlineData(ProcessingPurpose.PurposeKind.Reservation, PurposeDecision.DecisionValue.Denied)]
    public void A_Decision_On_A_Version_That_Was_Not_Given_Is_Rejected(
        ProcessingPurpose.PurposeKind kind,
        PurposeDecision.DecisionValue decision)
    {
        var current = Current(kind, version: 2);
        var missing = Retired(kind, version: 1);

        Assert.Throws<ArgumentException>(() => PurposeEvaluation.Evaluate(
            Versions(current),
            organizationWide: DecisionOn(missing, decision)));
    }

    [Fact]
    public void ReconsentRequiredFromVersion_Is_The_Latest_Material_Change()
    {
        var versions = Versions(
            Retired(ProcessingPurpose.PurposeKind.Consent, version: 1),
            Retired(ProcessingPurpose.PurposeKind.Consent, version: 2, requiresReconsent: true),
            Retired(ProcessingPurpose.PurposeKind.Consent, version: 3),
            Current(ProcessingPurpose.PurposeKind.Consent, version: 4));

        Assert.Equal(2, PurposeEvaluation.ReconsentRequiredFromVersion(versions));
    }

    [Fact]
    public void ReconsentRequiredFromVersion_Is_Null_Without_A_Material_Change()
    {
        var versions = Versions(Current(ProcessingPurpose.PurposeKind.Consent, version: 1));

        Assert.Null(PurposeEvaluation.ReconsentRequiredFromVersion(versions));
    }

    private static void AssertOutcome(
        PurposeOutcome outcome,
        PurposeStatus status,
        bool mayProcess,
        bool mustAsk)
    {
        Assert.Equal(status, outcome.Status);
        Assert.Equal(mayProcess, outcome.MayProcess);
        Assert.Equal(mustAsk, outcome.MustAsk);
    }

    private static IReadOnlyCollection<ProcessingPurpose> Versions(params ProcessingPurpose[] versions)
        => versions;

    private static ProcessingPurpose Current(
        ProcessingPurpose.PurposeKind kind,
        int version,
        bool requiresReconsent = false,
        string? code = null,
        Guid? organizationUuid = null)
        => new()
        {
            OrganizationUuid = organizationUuid ?? OrganizationUuid,
            Code = code ?? PurposeCodes.MarketingNewsletter,
            Version = version,
            Kind = kind,
            Name = "Newsletter",
            Text = $"Version {version} of the purpose text.",
            RequiresReconsent = requiresReconsent
        };

    private static ProcessingPurpose Retired(
        ProcessingPurpose.PurposeKind kind,
        int version,
        bool requiresReconsent = false)
    {
        var purpose = Current(kind, version, requiresReconsent);
        purpose.RetiredAt = SystemClock.Instance.GetCurrentInstant();
        return purpose;
    }

    private static PurposeDecision DecisionOn(
        ProcessingPurpose purpose,
        PurposeDecision.DecisionValue decision)
        => new()
        {
            UserId = Guid.CreateVersion7(),
            OrganizationUuid = purpose.OrganizationUuid,
            Code = purpose.Code,
            ProcessingPurposeUuid = purpose.Uuid,
            Decision = decision
        };
}
