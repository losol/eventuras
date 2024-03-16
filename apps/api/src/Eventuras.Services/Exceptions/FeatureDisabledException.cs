namespace Eventuras.Services.Exceptions;

public class FeatureDisabledException : ServiceException
{
    public FeatureDisabledException(string message) : base(message)
    {
    }
}
