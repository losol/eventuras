using Eventuras.Domain;
using Xunit;

namespace Eventuras.UnitTests.RegistrationTests;

public class RegistrationEnumTests
{
    [Theory]
    [InlineData(Registration.RegistrationStatus.Draft, 0)]
    [InlineData(Registration.RegistrationStatus.Cancelled, 1)]
    [InlineData(Registration.RegistrationStatus.Verified, 2)]
    [InlineData(Registration.RegistrationStatus.NotAttended, 3)]
    [InlineData(Registration.RegistrationStatus.Attended, 4)]
    [InlineData(Registration.RegistrationStatus.Finished, 5)]
    [InlineData(Registration.RegistrationStatus.WaitingList, 6)]
    public void RegistrationStatus_ShouldHaveCorrectValue(Registration.RegistrationStatus status, int expectedValue) =>
        // Assert
        Assert.Equal(expectedValue, (int)status);

    [Theory]
    [InlineData(Registration.RegistrationType.Participant, 0)]
    [InlineData(Registration.RegistrationType.Student, 1)]
    [InlineData(Registration.RegistrationType.Staff, 2)]
    [InlineData(Registration.RegistrationType.Lecturer, 3)]
    [InlineData(Registration.RegistrationType.Artist, 4)]
    public void RegistrationType_ShouldHaveCorrectValue(Registration.RegistrationType type, int expectedValue) =>
        // Assert
        Assert.Equal(expectedValue, (int)type);

    [Fact]
    public void RegistrationStatus_ToString_ShouldReturnName()
    {
        // Arrange
        var status = Registration.RegistrationStatus.Verified;

        // Act
        var result = status.ToString();

        // Assert
        Assert.Equal("Verified", result);
    }

    [Fact]
    public void RegistrationType_ToString_ShouldReturnName()
    {
        // Arrange
        var type = Registration.RegistrationType.Lecturer;

        // Act
        var result = type.ToString();

        // Assert
        Assert.Equal("Lecturer", result);
    }
}
