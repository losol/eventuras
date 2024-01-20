using System.Collections.Generic;
using Eventuras.Domain;

namespace Eventuras.Servcies.Registrations;

public class RegistrationStatistics
{
    public Dictionary<Registration.RegistrationStatus, int> StatusCounts { get; set; }
    public Dictionary<Registration.RegistrationType, int> TypeCounts { get; set; }
}
