
using System.Collections.Generic;
using Eventuras.Domain;

namespace Eventuras.WebApi.Controllers.v3.Events.Statistics;
public class EventStatisticsDto
{
    public Dictionary<Registration.RegistrationStatus, int> ByStatus { get; set; }
}