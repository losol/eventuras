using System;
using System.Collections.Generic;
using Eventuras.Domain;
using Xunit;

namespace Eventuras.UnitTests.RegistrationTests;

public class RegistrationDomainTests
{
    #region HasOrder Tests

    [Fact]
    public void HasOrder_WhenOrdersIsNull_ShouldReturnFalse()
    {
        // Arrange
        var registration = new Registration { Orders = null };

        // Act
        var result = registration.HasOrder;

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void HasOrder_WhenOrdersIsEmpty_ShouldReturnFalse()
    {
        // Arrange
        var registration = new Registration { Orders = new List<Order>() };

        // Act
        var result = registration.HasOrder;

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void HasOrder_WhenOrdersHasOneOrder_ShouldReturnTrue()
    {
        // Arrange
        var registration = new Registration { Orders = new List<Order> { new() } };

        // Act
        var result = registration.HasOrder;

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void HasOrder_WhenOrdersHasMultipleOrders_ShouldReturnTrue()
    {
        // Arrange
        var registration = new Registration { Orders = new List<Order> { new(), new(), new() } };

        // Act
        var result = registration.HasOrder;

        // Assert
        Assert.True(result);
    }

    #endregion

    #region HasCertificate Tests

    [Fact]
    public void HasCertificate_WhenCertificateIdIsNull_ShouldReturnFalse()
    {
        // Arrange
        var registration = new Registration { CertificateId = null };

        // Act
        var result = registration.HasCertificate;

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void HasCertificate_WhenCertificateIdIsSet_ShouldReturnTrue()
    {
        // Arrange
        var registration = new Registration { CertificateId = 123 };

        // Act
        var result = registration.HasCertificate;

        // Assert
        Assert.True(result);
    }

    #endregion

    #region AddLog Tests

    [Fact]
    public void AddLog_WithNoText_ShouldAddStatusToLog()
    {
        // Arrange
        var registration = new Registration { Status = Registration.RegistrationStatus.Verified, Log = null };

        // Act
        registration.AddLog();

        // Assert
        Assert.NotNull(registration.Log);
        Assert.Contains("Verified", registration.Log);
    }

    [Fact]
    public void AddLog_WithCustomText_ShouldAddTextToLog()
    {
        // Arrange
        var registration = new Registration { Log = null };
        var customText = "User registered successfully";

        // Act
        registration.AddLog(customText);

        // Assert
        Assert.NotNull(registration.Log);
        Assert.Contains(customText, registration.Log);
    }

    [Fact]
    public void AddLog_MultipleCalls_ShouldAppendToLog()
    {
        // Arrange
        var registration = new Registration { Status = Registration.RegistrationStatus.Draft, Log = null };

        // Act
        registration.AddLog("First entry");
        registration.AddLog("Second entry");
        registration.AddLog("Third entry");

        // Assert
        Assert.Contains("First entry", registration.Log);
        Assert.Contains("Second entry", registration.Log);
        Assert.Contains("Third entry", registration.Log);
    }

    [Fact]
    public void AddLog_ShouldIncludeTimestamp()
    {
        // Arrange
        var registration = new Registration { Log = null };

        // Act
        registration.AddLog("Test");

        // Assert
        Assert.NotNull(registration.Log);
        // Check that log contains a timestamp (basic check)
        Assert.Matches(@"\d{4}-\d{2}-\d{2}", registration.Log);
    }

    #endregion

    #region CreateCertificate Tests

    [Fact]
    public void CreateCertificate_WhenCertificateIsNull_ShouldCreateNewCertificate()
    {
        // Arrange
        var registration = new Registration
        {
            RegistrationId = 1,
            Certificate = null,
            EventInfo = new EventInfo { EventInfoId = 1, Title = "Test Event" },
            User = new ApplicationUser
            {
                Id = "user1",
                GivenName = "Test",
                FamilyName = "User",
                Email = "test@example.com"
            },
            CertificateComment = "Great participation"
        };

        // Act
        var certificate = registration.CreateCertificate();

        // Assert
        Assert.NotNull(certificate);
        Assert.NotNull(registration.Certificate);
        Assert.Same(certificate, registration.Certificate);
    }

    [Fact]
    public void CreateCertificate_WhenCertificateAlreadyExists_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var registration = new Registration
        {
            RegistrationId = 1,
            Certificate = new Certificate(),
            EventInfo = new EventInfo(),
            User = new ApplicationUser()
        };

        // Act & Assert
        var exception = Assert.Throws<InvalidOperationException>(() =>
            registration.CreateCertificate());

        Assert.Contains("already set", exception.Message);
    }

    [Fact]
    public void CreateCertificate_ShouldPopulateCertificateWithUserInfo()
    {
        // Arrange
        var registration = new Registration
        {
            RegistrationId = 1,
            Certificate = null,
            EventInfo = new EventInfo { EventInfoId = 1, Title = "Test Event" },
            User = new ApplicationUser
            {
                Id = "user123",
                GivenName = "John",
                FamilyName = "Doe",
                Email = "john@example.com"
            },
            CertificateComment = "Excellent work"
        };

        // Act
        var certificate = registration.CreateCertificate();

        // Assert
        Assert.Equal("John Doe", certificate.RecipientName);
        Assert.Equal("john@example.com", certificate.RecipientEmail);
        Assert.Equal("user123", certificate.RecipientUserId);
        Assert.Equal("Excellent work", certificate.Comment);
    }

    #endregion

    #region UpdateCertificate Tests

    [Fact]
    public void UpdateCertificate_WhenCertificateIsNull_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var registration = new Registration { Certificate = null };

        // Act & Assert
        var exception = Assert.Throws<InvalidOperationException>(() =>
            registration.UpdateCertificate());

        Assert.Contains("Certificate", exception.Message);
        Assert.Contains("null", exception.Message);
    }

    [Fact]
    public void UpdateCertificate_WhenEventInfoIsNull_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var registration = new Registration
        {
            Certificate = new Certificate(),
            EventInfo = null,
            User = new ApplicationUser()
        };

        // Act & Assert
        var exception = Assert.Throws<InvalidOperationException>(() =>
            registration.UpdateCertificate());

        Assert.Contains("EventInfo", exception.Message);
    }

    [Fact]
    public void UpdateCertificate_WhenUserIsNull_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var registration = new Registration
        {
            Certificate = new Certificate(),
            EventInfo = new EventInfo(),
            User = null
        };

        // Act & Assert
        var exception = Assert.Throws<InvalidOperationException>(() =>
            registration.UpdateCertificate());

        Assert.Contains("User", exception.Message);
    }

    [Fact]
    public void UpdateCertificate_WithValidData_ShouldUpdateCertificate()
    {
        // Arrange
        var registration = new Registration
        {
            RegistrationId = 1,
            Certificate = new Certificate { RecipientName = "Old Name", RecipientEmail = "old@example.com" },
            EventInfo = new EventInfo { EventInfoId = 1, Title = "Updated Event" },
            User = new ApplicationUser
            {
                Id = "user456",
                GivenName = "Jane",
                FamilyName = "Smith",
                Email = "jane@example.com"
            },
            CertificateComment = "Updated comment"
        };

        // Act
        var result = registration.UpdateCertificate();

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Jane Smith", result.RecipientName);
        Assert.Equal("jane@example.com", result.RecipientEmail);
        Assert.Equal("user456", result.RecipientUserId);
        Assert.Equal("Updated comment", result.Comment);
    }

    #endregion

    #region Registration Status Tests

    [Fact]
    public void Status_DefaultValue_ShouldBeDraft()
    {
        // Arrange & Act
        var registration = new Registration();

        // Assert
        Assert.Equal(Registration.RegistrationStatus.Draft, registration.Status);
    }

    [Fact]
    public void Type_DefaultValue_ShouldBeParticipant()
    {
        // Arrange & Act
        var registration = new Registration();

        // Assert
        Assert.Equal(Registration.RegistrationType.Participant, registration.Type);
    }

    [Fact]
    public void Diploma_DefaultValue_ShouldBeTrue()
    {
        // Arrange & Act
        var registration = new Registration();

        // Assert
        Assert.True(registration.Diploma);
    }

    #endregion
}
