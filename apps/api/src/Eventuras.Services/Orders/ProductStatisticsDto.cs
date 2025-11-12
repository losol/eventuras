namespace Eventuras.Services.Orders;

public class ByRegistrationStatus
{
    public int Draft { get; set; }
    public int Cancelled { get; set; }
    public int Verified { get; set; }
    public int NotAttended { get; set; }
    public int Attended { get; set; }
    public int Finished { get; set; }
    public int WaitingList { get; set; }
}

public class ProductStatisticsDto
{
    public ByRegistrationStatus ByRegistrationStatus { get; set; }
}
