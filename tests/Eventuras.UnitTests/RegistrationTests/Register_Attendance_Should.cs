using Eventuras.Domain;
using Xunit;
using static Eventuras.Domain.Registration;

namespace Eventuras.UnitTests.RegistrationTests;

public class Register_Attendance_Should
{
    [Fact]
    public void Succeed_When_Not_Attended()
    {
        var registration = new Registration();
        var expected = RegistrationStatus.Attended;

        registration.MarkAsAttended();
        var actual = registration.Status;

        Assert.Equal(expected, actual);
    }

    [Fact]
    public void Succeed_When_Already_Attended()
    {
        var registration = new Registration { Status = RegistrationStatus.Attended };
        var expected = RegistrationStatus.Attended;

        registration.MarkAsAttended();
        var actual = registration.Status;

        Assert.Equal(expected, actual);
    }
}