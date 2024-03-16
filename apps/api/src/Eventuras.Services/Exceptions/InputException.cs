namespace Eventuras.Services.Exceptions;

public class InputException : ServiceException
{
    public InputException(string message) : base(message)
    {
    }
}
