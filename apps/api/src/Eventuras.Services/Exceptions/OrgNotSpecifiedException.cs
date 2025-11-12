namespace Eventuras.Services.Exceptions;

/// <summary>
///     Organization is not configured for the current hostname,
///     and not specified in the request parameters.
/// </summary>
public class OrgNotSpecifiedException : ServiceException
{
    public OrgNotSpecifiedException(string hostname) :
        base("Current org can't be determined. " +
             "Please provide the organization id via the orgId request parameter.")
    {
    }
}
