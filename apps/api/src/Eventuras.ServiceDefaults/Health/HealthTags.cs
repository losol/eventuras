namespace Eventuras.ServiceDefaults;

/// <summary>
///     Conventional health-check tags shared across the solution.
/// </summary>
public static class HealthTags
{
    /// <summary>Liveness — minimal "is the process up" checks (/alive probe).</summary>
    public const string Live = "live";

    /// <summary>Readiness — "can serve traffic" checks.</summary>
    public const string Ready = "ready";

    /// <summary>
    ///     Admin-facing diagnostics (e.g. pending migrations). Excluded from the
    ///     Kubernetes probe /health endpoint; surfaced via /health/diagnostics.
    /// </summary>
    public const string Diagnostics = "diagnostics";
}
