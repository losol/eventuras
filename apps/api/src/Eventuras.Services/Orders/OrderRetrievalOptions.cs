namespace Eventuras.Services.Orders;

public class OrderRetrievalOptions
{
    public bool IncludeRegistration { get; set; }

    public bool IncludeUser { get; set; }

    public bool IncludeOrderLines { get; set; }

    public bool IncludeEvent { get; set; }

    public static OrderRetrievalOptions ForInvoicing() =>
        new() { IncludeRegistration = true, IncludeUser = true, IncludeEvent = true, IncludeOrderLines = true };
}
