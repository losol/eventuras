﻿#nullable enable

using Eventuras.Domain;
using Eventuras.Services.Events;
using Eventuras.Services.Exceptions;
using Eventuras.Services.Organizations;
using Eventuras.Services.Registrations;
using Microsoft.AspNetCore.Http;
using Moq;
using NodaTime;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using static Eventuras.Services.Tests.HttpContextAccessorUtils;

namespace Eventuras.Services.Tests.Registrations;

public class RegistrationAccessControlServiceTests
{
    [Fact]
    public async Task CheckRegistrationUpdateAccessAsync_DefaultEventInfoOptions_PassesForOwner()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var user = GetUser(userId);
        HttpContextAccessor.HttpContext = new DefaultHttpContext { User = user };

        var ei = new EventInfo();
        var reg = new Registration { UserId = userId, EventInfoId = ei.EventInfoId, EventInfo = ei };

        var eventInfoRetrievalService = ServiceMocks.MockEventInfoRetrievalService(out var eiMock, ei);
        var organizationAccessorService = Mock.Of<ICurrentOrganizationAccessorService>(MockBehavior.Strict); // should not be called

        var testSubject = new RegistrationAccessControlService(HttpContextAccessor, eventInfoRetrievalService, organizationAccessorService);

        // Act
        await testSubject.CheckRegistrationUpdateAccessAsync(reg, CancellationToken.None);

        // Assert
        eiMock.Verify(s => s.GetEventInfoByIdAsync(It.IsAny<int>(), It.IsAny<EventInfoRetrievalOptions>(), It.IsAny<CancellationToken>()),
            Times.Once);
        eiMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task CheckRegistrationUpdateAccessAsync_DefaultEventInfoOptions_ThrowsForNonOwner()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var user = GetUser(userId);
        HttpContextAccessor.HttpContext = new DefaultHttpContext { User = user };
        var otherUserId = Guid.NewGuid().ToString();

        var ei = new EventInfo();
        var reg = new Registration { UserId = otherUserId, EventInfoId = ei.EventInfoId, EventInfo = ei };

        var eventInfoRetrievalService = ServiceMocks.MockEventInfoRetrievalService(out var eiMock, ei);
        var organizationAccessorService = Mock.Of<ICurrentOrganizationAccessorService>(MockBehavior.Strict); // should not be called

        var testSubject = new RegistrationAccessControlService(HttpContextAccessor, eventInfoRetrievalService, organizationAccessorService);

        // Act
        await Assert.ThrowsAsync<NotAccessibleException>(
            async () => await testSubject.CheckRegistrationUpdateAccessAsync(reg, CancellationToken.None));

        // Assert
        eiMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task CheckRegistrationUpdateAccessAsync_DefaultEventInfoOptions_PassesForAdmin()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var user = GetUser(userId, Roles.SuperAdmin);
        HttpContextAccessor.HttpContext = new DefaultHttpContext { User = user };
        var otherUserId = Guid.NewGuid().ToString();

        var ei = new EventInfo();
        var reg = new Registration { UserId = otherUserId, EventInfoId = ei.EventInfoId, EventInfo = ei };

        var eventInfoRetrievalService = ServiceMocks.MockEventInfoRetrievalService(out var eiMock, ei);
        var organizationAccessorService = Mock.Of<ICurrentOrganizationAccessorService>(MockBehavior.Strict); // should not be called

        var testSubject = new RegistrationAccessControlService(HttpContextAccessor, eventInfoRetrievalService, organizationAccessorService);

        // Act
        await testSubject.CheckRegistrationUpdateAccessAsync(reg, CancellationToken.None);

        // Assert
        eiMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task CheckRegistrationUpdateAccessAsync_WithAllowedRegistrationEditHours_PassesBeforeDue()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var user = GetUser(userId);
        HttpContextAccessor.HttpContext = new DefaultHttpContext { User = user };

        var policy = new EventInfoOptions.EventInfoRegistrationPolicy { AllowedRegistrationEditHours = 24 };
        var ei = new EventInfo { Options = new EventInfoOptions { RegistrationPolicy = policy } };
        var reg = new Registration { UserId = userId, EventInfoId = ei.EventInfoId, EventInfo = ei };

        var eventInfoRetrievalService = ServiceMocks.MockEventInfoRetrievalService(out var eiMock, ei);
        var organizationAccessorService = Mock.Of<ICurrentOrganizationAccessorService>(MockBehavior.Strict); // should not be called

        var testSubject = new RegistrationAccessControlService(HttpContextAccessor, eventInfoRetrievalService, organizationAccessorService);

        // Act
        await testSubject.CheckRegistrationUpdateAccessAsync(reg, CancellationToken.None);

        // Assert
        eiMock.Verify(s => s.GetEventInfoByIdAsync(It.IsAny<int>(), It.IsAny<EventInfoRetrievalOptions>(), It.IsAny<CancellationToken>()),
            Times.Once);
        eiMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task CheckRegistrationUpdateAccessAsync_WithAllowedRegistrationEditHours_ThrowsAfterDue()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var user = GetUser(userId);
        HttpContextAccessor.HttpContext = new DefaultHttpContext { User = user };

        var policy = new EventInfoOptions.EventInfoRegistrationPolicy { AllowedRegistrationEditHours = 24 };
        var ei = new EventInfo { Options = new EventInfoOptions { RegistrationPolicy = policy } };
        var registrationTime = Instant.FromDateTimeUtc(DateTime.UtcNow.AddDays(-2));
        var reg = new Registration { UserId = userId, EventInfoId = ei.EventInfoId, EventInfo = ei, RegistrationTime = registrationTime };

        var eventInfoRetrievalService = ServiceMocks.MockEventInfoRetrievalService(out var eiMock, ei);
        var organizationAccessorService = Mock.Of<ICurrentOrganizationAccessorService>(MockBehavior.Strict); // should not be called

        var testSubject = new RegistrationAccessControlService(HttpContextAccessor, eventInfoRetrievalService, organizationAccessorService);

        // Act
        await Assert.ThrowsAsync<NotAccessibleException>(
            async () => await testSubject.CheckRegistrationUpdateAccessAsync(reg, CancellationToken.None));

        // Assert
        eiMock.Verify(s => s.GetEventInfoByIdAsync(It.IsAny<int>(), It.IsAny<EventInfoRetrievalOptions>(), It.IsAny<CancellationToken>()),
            Times.Once);
        eiMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task CheckRegistrationUpdateAccessAsync_WithoutAllowedRegistrationEditHours_PassesBeforeDue()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var user = GetUser(userId);
        HttpContextAccessor.HttpContext = new DefaultHttpContext { User = user };

        var policy = new EventInfoOptions.EventInfoRegistrationPolicy { AllowedRegistrationEditHours = null };
        var ei = new EventInfo { Options = new EventInfoOptions { RegistrationPolicy = policy } };
        var reg = new Registration { UserId = userId, EventInfoId = ei.EventInfoId, EventInfo = ei };

        var eventInfoRetrievalService = ServiceMocks.MockEventInfoRetrievalService(out var eiMock, ei);
        var organizationAccessorService = Mock.Of<ICurrentOrganizationAccessorService>(MockBehavior.Strict); // should not be called

        var testSubject = new RegistrationAccessControlService(HttpContextAccessor, eventInfoRetrievalService, organizationAccessorService);

        // Act
        await testSubject.CheckRegistrationUpdateAccessAsync(reg, CancellationToken.None);

        // Assert
        eiMock.Verify(s => s.GetEventInfoByIdAsync(It.IsAny<int>(), It.IsAny<EventInfoRetrievalOptions>(), It.IsAny<CancellationToken>()),
            Times.Once);
        eiMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task CheckRegistrationUpdateAccessAsync_WithoutAllowedRegistrationEditHours_PassesAfterDue()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var user = GetUser(userId);
        HttpContextAccessor.HttpContext = new DefaultHttpContext { User = user };

        var policy = new EventInfoOptions.EventInfoRegistrationPolicy { AllowedRegistrationEditHours = null };
        var ei = new EventInfo { Options = new EventInfoOptions { RegistrationPolicy = policy } };
        var registrationTime = Instant.FromDateTimeUtc(DateTime.UtcNow.AddDays(-2));
        var reg = new Registration { UserId = userId, EventInfoId = ei.EventInfoId, EventInfo = ei, RegistrationTime = registrationTime };

        var eventInfoRetrievalService = ServiceMocks.MockEventInfoRetrievalService(out var eiMock, ei);
        var organizationAccessorService = Mock.Of<ICurrentOrganizationAccessorService>(MockBehavior.Strict); // should not be called

        var testSubject = new RegistrationAccessControlService(HttpContextAccessor, eventInfoRetrievalService, organizationAccessorService);

        // Act
        await testSubject.CheckRegistrationUpdateAccessAsync(reg, CancellationToken.None);

        // Assert
        eiMock.Verify(s => s.GetEventInfoByIdAsync(It.IsAny<int>(), It.IsAny<EventInfoRetrievalOptions>(), It.IsAny<CancellationToken>()),
            Times.Once);
        eiMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task CheckRegistrationUpdateAccessAsync_WithLastCancellationDateLimit_PassesBeforeDue()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var user = GetUser(userId);
        HttpContextAccessor.HttpContext = new DefaultHttpContext { User = user };

        var policy = new EventInfoOptions.EventInfoRegistrationPolicy { AllowModificationsAfterLastCancellationDate = false };
        var cancellationDue = LocalDate.FromDateTime(DateTime.UtcNow.AddDays(1));
        var ei = new EventInfo { Options = new EventInfoOptions { RegistrationPolicy = policy }, LastCancellationDate = cancellationDue };
        var reg = new Registration { UserId = userId, EventInfoId = ei.EventInfoId, EventInfo = ei };

        var eventInfoRetrievalService = ServiceMocks.MockEventInfoRetrievalService(out var eiMock, ei);
        var organizationAccessorService = Mock.Of<ICurrentOrganizationAccessorService>(MockBehavior.Strict); // should not be called

        var testSubject = new RegistrationAccessControlService(HttpContextAccessor, eventInfoRetrievalService, organizationAccessorService);

        // Act
        await testSubject.CheckRegistrationUpdateAccessAsync(reg, CancellationToken.None);

        // Assert
        eiMock.Verify(s => s.GetEventInfoByIdAsync(It.IsAny<int>(), It.IsAny<EventInfoRetrievalOptions>(), It.IsAny<CancellationToken>()),
            Times.Once);
        eiMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task CheckRegistrationUpdateAccessAsync_WithLastCancellationDateLimit_ThrowsAfterDue()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var user = GetUser(userId);
        HttpContextAccessor.HttpContext = new DefaultHttpContext { User = user };

        var policy = new EventInfoOptions.EventInfoRegistrationPolicy { AllowModificationsAfterLastCancellationDate = false };
        var cancellationDue = LocalDate.FromDateTime(DateTime.UtcNow.AddDays(-2));
        var ei = new EventInfo { Options = new EventInfoOptions { RegistrationPolicy = policy }, LastCancellationDate = cancellationDue };
        var reg = new Registration { UserId = userId, EventInfoId = ei.EventInfoId, EventInfo = ei };

        var eventInfoRetrievalService = ServiceMocks.MockEventInfoRetrievalService(out var eiMock, ei);
        var organizationAccessorService = Mock.Of<ICurrentOrganizationAccessorService>(MockBehavior.Strict); // should not be called

        var testSubject = new RegistrationAccessControlService(HttpContextAccessor, eventInfoRetrievalService, organizationAccessorService);

        // Act
        await Assert.ThrowsAsync<NotAccessibleException>(
            async () => await testSubject.CheckRegistrationUpdateAccessAsync(reg, CancellationToken.None));

        // Assert
        eiMock.Verify(s => s.GetEventInfoByIdAsync(It.IsAny<int>(), It.IsAny<EventInfoRetrievalOptions>(), It.IsAny<CancellationToken>()),
            Times.Once);
        eiMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task CheckRegistrationUpdateAccessAsync_WithoutLastCancellationDateLimit_PassesBeforeDue()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var user = GetUser(userId);
        HttpContextAccessor.HttpContext = new DefaultHttpContext { User = user };

        var policy = new EventInfoOptions.EventInfoRegistrationPolicy { AllowModificationsAfterLastCancellationDate = true };
        var cancellationDue = LocalDate.FromDateTime(DateTime.UtcNow.AddDays(1));
        var ei = new EventInfo { Options = new EventInfoOptions { RegistrationPolicy = policy }, LastCancellationDate = cancellationDue };
        var reg = new Registration { UserId = userId, EventInfoId = ei.EventInfoId, EventInfo = ei };

        var eventInfoRetrievalService = ServiceMocks.MockEventInfoRetrievalService(out var eiMock, ei);
        var organizationAccessorService = Mock.Of<ICurrentOrganizationAccessorService>(MockBehavior.Strict); // should not be called

        var testSubject = new RegistrationAccessControlService(HttpContextAccessor, eventInfoRetrievalService, organizationAccessorService);

        // Act
        await testSubject.CheckRegistrationUpdateAccessAsync(reg, CancellationToken.None);

        // Assert
        eiMock.Verify(s => s.GetEventInfoByIdAsync(It.IsAny<int>(), It.IsAny<EventInfoRetrievalOptions>(), It.IsAny<CancellationToken>()),
            Times.Once);
        eiMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task CheckRegistrationUpdateAccessAsync_WithoutLastCancellationDateLimit_PassesAfterDue()
    {
        // Arrange
        var userId = Guid.NewGuid().ToString();
        var user = GetUser(userId);
        HttpContextAccessor.HttpContext = new DefaultHttpContext { User = user };

        var policy = new EventInfoOptions.EventInfoRegistrationPolicy { AllowModificationsAfterLastCancellationDate = true };
        var cancellationDue = LocalDate.FromDateTime(DateTime.UtcNow.AddDays(-2));
        var ei = new EventInfo { Options = new EventInfoOptions { RegistrationPolicy = policy }, LastCancellationDate = cancellationDue };
        var reg = new Registration { UserId = userId, EventInfoId = ei.EventInfoId, EventInfo = ei };

        var eventInfoRetrievalService = ServiceMocks.MockEventInfoRetrievalService(out var eiMock, ei);
        var organizationAccessorService = Mock.Of<ICurrentOrganizationAccessorService>(MockBehavior.Strict); // should not be called

        var testSubject = new RegistrationAccessControlService(HttpContextAccessor, eventInfoRetrievalService, organizationAccessorService);

        // Act
        await testSubject.CheckRegistrationUpdateAccessAsync(reg, CancellationToken.None);

        // Assert
        eiMock.Verify(s => s.GetEventInfoByIdAsync(It.IsAny<int>(), It.IsAny<EventInfoRetrievalOptions>(), It.IsAny<CancellationToken>()),
            Times.Once);
        eiMock.VerifyNoOtherCalls();
    }

    private static readonly IHttpContextAccessor HttpContextAccessor = new HttpContextAccessor();
}