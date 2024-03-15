using Eventuras.Domain;
using Xunit;
using static Eventuras.Domain.Registration;

namespace Eventuras.UnitTests.RegistrationTests;

public class Verify_Should
{
    [Fact]
    public void Succeed_When_Not_Verified()
    {
        Registration registration = new Registration();
        var expected = true;

        registration.Verify();
        var actual = registration.Verified;

        Assert.Equal(expected, actual);
    }

    [Fact]
    public void Succeed_When_Already_Verified()
    {
        Registration registration = new Registration { Verified = true, Status = RegistrationStatus.Verified };


        registration.Verify();


        Assert.True(registration.Verified);
        Assert.Equal(RegistrationStatus.Verified, registration.Status);
    }
}
