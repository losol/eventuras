namespace Eventuras.WebApi.Controllers.v3.Events.Statistics;

public class ByStatus
{
    public int Draft { get; set; }
    public int Cancelled { get; set; }
    public int Verified { get; set; }
    public int NotAttended { get; set; }
    public int Attended { get; set; }
    public int Finished { get; set; }
    public int WaitingList { get; set; }
}

public class ByType
{
    public int Participant { get; set; }
    public int Student { get; set; }
    public int Staff { get; set; }
    public int Lecturer { get; set; }
    public int Artist { get; set; }
}

public class EventStatisticsDto
{
    public ByStatus ByStatus { get; set; }
    public ByType ByType { get; set; }
}
