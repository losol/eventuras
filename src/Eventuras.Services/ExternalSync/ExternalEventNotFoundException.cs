namespace Eventuras.Services.ExternalSync;

public class ExternalEventNotFoundException : ExternalSyncException
{
    public ExternalEventNotFoundException(string message) : base(message) { }
}