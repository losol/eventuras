using Eventuras.Services.Users;
using static Eventuras.Domain.Registration;

namespace Eventuras.Services.Orders;

public class ProductOrdersSummaryDto
{
    public int RegistrationId { get; set; }
    public RegistrationStatus RegistrationStatus { get; set; }
    public UserSummaryDto User { get; set; }
    public int[] OrderIds { get; set; }
    public int SumQuantity { get; set; }
}
