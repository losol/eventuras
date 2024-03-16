using System.Collections.Generic;
using Eventuras.Domain;
using Xunit;

namespace Eventuras.UnitTests.RegistrationTests;

public class Has_Order_Should
{
    [Fact]
    public void Return_False_If_Null()
    {
        var registration = new Registration { };
        Assert.False(registration.HasOrder);
    }

    [Fact]
    public void Return_False_If_Zero()
    {
        var registration = new Registration { Orders = new List<Order>() };
        Assert.False(registration.HasOrder);
    }

    [Fact]
    public void Return_True_If_Has_Order()
    {
        var registration = new Registration
        {
            Orders = new List<Order>() {
                new Order()
            }
        };
        Assert.True(registration.HasOrder);
    }
}
