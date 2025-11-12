using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Services.Organizations;
using Eventuras.Services.Organizations.Settings;
using Moq;
using Xunit;

namespace Eventuras.Services.Tests.Organizations.Settings;

public class OrganizationSettingsAccessorServiceTests
{
    private readonly Mock<ICurrentOrganizationAccessorService> _currentOrganizationAccessorServiceMock = new();

    private readonly Organization _org = new() { OrganizationId = 1001 };

    private readonly Mock<IOrganizationRetrievalService> _organizationRetrievalServiceMock = new();

    private readonly Mock<IOrganizationSettingsCache> _organizationSettingsCacheMock = new();

    private readonly IOrganizationSettingsAccessorService _service;
    private readonly List<OrganizationSetting> _settings = new();

    public OrganizationSettingsAccessorServiceTests()
    {
        _currentOrganizationAccessorServiceMock.Setup(s => s
                .RequireCurrentOrganizationAsync(It.IsAny<OrganizationRetrievalOptions>(),
                    It.IsAny<CancellationToken>()))
            .ReturnsAsync(_org);

        _organizationSettingsCacheMock.Setup(s => s
                .GetAllSettingsForOrganizationAsync(_org.OrganizationId))
            .ReturnsAsync(_settings.ToArray);

        _service = new OrganizationSettingsAccessorService(
            _currentOrganizationAccessorServiceMock.Object,
            _organizationSettingsCacheMock.Object,
            _organizationRetrievalServiceMock.Object);
    }

    [Fact]
    public async Task Should_Convert_Poco_Value_Types()
    {
        _settings.Add(new OrganizationSetting { Name = TestSettingsConstants.SettingsKey, Value = "123" });

        var poco = await _service.ReadOrganizationSettingsAsync<SettingsPocoWithIntegerMappedField>();
        Assert.NotNull(poco);
        Assert.Equal(123, poco.Setting);
    }

    [Fact]
    public async Task Should_Not_Convert_Invalid_Poco_Value_Types()
    {
        _settings.Add(new OrganizationSetting { Name = TestSettingsConstants.SettingsKey, Value = "abc" });

        await Assert.ThrowsAsync<FormatException>(() => _service
            .ReadOrganizationSettingsAsync<SettingsPocoWithIntegerMappedField>());
    }

    [Fact]
    public async Task Should_Return_Empty_Poco_With_No_Mapped_Fields()
    {
        var poco = await _service
            .ReadOrganizationSettingsAsync<SettingsPocoWithNoFieldsMapped>();

        Assert.NotNull(poco);
        Assert.Null(poco.Something);
    }

    [Fact]
    public async Task Should_Return_Empty_Poco_With_Optional_Mapped_Field()
    {
        var poco = await _service
            .ReadOrganizationSettingsAsync<SettingsPocoWithSingleOptionalMappedField>();

        Assert.NotNull(poco);
        Assert.Null(poco.Setting);
    }

    [Fact]
    public async Task Should_Throw_Validation_Exception_On_Invalid_Poco() =>
        await Assert.ThrowsAsync<ValidationException>(() => _service
            .ReadOrganizationSettingsAsync<SettingsPocoWithSingleRequiredMappedField>());

    [Fact]
    public async Task Should_Return_Poco_From_Settings()
    {
        _settings.Add(new OrganizationSetting { Name = TestSettingsConstants.SettingsKey, Value = "abc" });

        var poco = await _service
            .ReadOrganizationSettingsAsync<SettingsPocoWithSingleRequiredMappedField>();

        Assert.Equal("abc", poco.Setting);
    }

    [Fact]
    public async Task Should_Support_Property_Name_Without_Org_Setting_Attribute()
    {
        _settings.Add(new OrganizationSetting
        {
            Name = $"{nameof(SettingsPocoWithNoFieldsMapped)}.{nameof(SettingsPocoWithNoFieldsMapped.Something)}",
            Value = "abc"
        });

        var poco = await _service
            .ReadOrganizationSettingsAsync<SettingsPocoWithNoFieldsMapped>();

        Assert.Equal("abc", poco.Something);
    }

    [Fact]
    public async Task Should_Not_Validate_Disabled_Setting()
    {
        var poco = await _service
            .ReadOrganizationSettingsAsync<ConfigurableSettingsPocoWithSingleRequiredField>();

        Assert.Null(poco.Setting);
    }

    [Fact]
    public async Task Should_Validate_Enabled_Setting()
    {
        _settings.Add(new OrganizationSetting
        {
            Name =
                $"{nameof(ConfigurableSettingsPocoWithSingleRequiredField)}.{nameof(ConfigurableSettingsPocoWithSingleRequiredField.Enabled)}",
            Value = "true"
        });

        await Assert.ThrowsAsync<ValidationException>(() => _service
            .ReadOrganizationSettingsAsync<ConfigurableSettingsPocoWithSingleRequiredField>());
    }
}

public class SettingsPocoWithNoFieldsMapped
{
    public string Something { get; set; }
}

public class SettingsPocoWithSingleOptionalMappedField
{
    [OrgSettingKey(TestSettingsConstants.SettingsKey)]
    public string Setting { get; set; }
}

public class SettingsPocoWithSingleRequiredMappedField
{
    [Required]
    [OrgSettingKey(TestSettingsConstants.SettingsKey)]
    public string Setting { get; set; }
}

public class SettingsPocoWithIntegerMappedField
{
    [OrgSettingKey(TestSettingsConstants.SettingsKey)]
    public int Setting { get; set; }
}

public class ConfigurableSettingsPocoWithSingleRequiredField : IConfigurableSettings
{
    [Required] public string Setting { get; set; }

    public bool Enabled { get; set; }
}

public static class TestSettingsConstants
{
    public const string SettingsKey = "TEST_SETTING";
}
