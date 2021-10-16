using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Eventuras.Services.Organizations.Settings;
using Xunit;

namespace Eventuras.Services.Tests.Organizations.Settings
{
    public class OrganizationSettingsRegistryTests
    {
        private readonly IOrganizationSettingsRegistry _registry;

        public OrganizationSettingsRegistryTests()
        {
            _registry = new OrganizationSettingsRegistry();
        }

        [Fact]
        public void RegisterSettings_Should_Accept_Types_Not_Annotated_With_Anything()
        {
            _registry.RegisterSettings<SettingsPocoWithNoDisplayNameAttributes>();

            var entries = _registry.GetEntries();
            Assert.NotNull(entries);

            var entry = entries.Single();
            Assert.Equal(nameof(SettingsPocoWithNoDisplayNameAttributes), entry.Section);
            Assert.Equal(nameof(SettingsPocoWithNoDisplayNameAttributes.Anything), entry.Name);
            Assert.Equal(nameof(SettingsPocoWithNoDisplayNameAttributes.Anything), entry.Description);
        }

        [Fact]
        public void RegisterSettings_Should_Use_OrgSettingKey_Attribute()
        {
            _registry.RegisterSettings<SettingsPocoWithOrgSettingKeyAttribute>();

            var entries = _registry.GetEntries();
            Assert.NotNull(entries);

            var entry = entries.Single();
            Assert.Equal(nameof(SettingsPocoWithOrgSettingKeyAttribute), entry.Section);
            Assert.Equal("SOME", entry.Name);
            Assert.Equal("SOME", entry.Description);
        }

        [Fact]
        public void RegisterSettings_Should_Use_DisplayName_Attribute()
        {
            _registry.RegisterSettings<SettingsPocoWithDisplayNameAttribute>();

            var entries = _registry.GetEntries();
            Assert.NotNull(entries);

            var entry = entries.Single();
            Assert.Equal(nameof(SettingsPocoWithDisplayNameAttribute), entry.Section);
            Assert.Equal(nameof(SettingsPocoWithDisplayNameAttribute.Something), entry.Name);
            Assert.Equal("Anything", entry.Description);
        }

        [Fact]
        public void RegisterSettings_Should_Use_DisplayName_And_OrgSettingKey_Attributes()
        {
            _registry.RegisterSettings<SettingsPocoWithAllAttributes>();

            var entries = _registry.GetEntries();
            Assert.NotNull(entries);

            var entry = entries.Single();
            Assert.Equal("TEST", entry.Section);
            Assert.Equal("SOME", entry.Name);
            Assert.Equal("Anything", entry.Description);
        }

        [Fact]
        public void RegisterSettings_Should_Define_Property_Types()
        {
            _registry.RegisterSettings<SettingsPocoWithAllPropertyTypes>();

            var entries = _registry.GetEntries().ToArray();
            Assert.NotNull(entries);
            Assert.NotEmpty(entries);

            Assert.Contains(entries, e =>
                e.Section == nameof(SettingsPocoWithAllPropertyTypes) &&
                e.Name == nameof(SettingsPocoWithAllPropertyTypes.String) &
                e.Type == OrganizationSettingType.String);

            Assert.Contains(entries, e =>
                e.Section == nameof(SettingsPocoWithAllPropertyTypes) &&
                e.Name == nameof(SettingsPocoWithAllPropertyTypes.Email) &
                e.Type == OrganizationSettingType.Email);

            Assert.Contains(entries, e =>
                e.Section == nameof(SettingsPocoWithAllPropertyTypes) &&
                e.Name == nameof(SettingsPocoWithAllPropertyTypes.Url) &
                e.Type == OrganizationSettingType.Url);

            Assert.Contains(entries, e =>
                e.Section == nameof(SettingsPocoWithAllPropertyTypes) &&
                e.Name == nameof(SettingsPocoWithAllPropertyTypes.Integer) &
                e.Type == OrganizationSettingType.Number);

            Assert.Contains(entries, e =>
                e.Section == nameof(SettingsPocoWithAllPropertyTypes) &&
                e.Name == nameof(SettingsPocoWithAllPropertyTypes.Long) &
                e.Type == OrganizationSettingType.Number);

            Assert.Contains(entries, e =>
                e.Section == nameof(SettingsPocoWithAllPropertyTypes) &&
                e.Name == nameof(SettingsPocoWithAllPropertyTypes.Short) &
                e.Type == OrganizationSettingType.Number);

            Assert.Contains(entries, e =>
                e.Section == nameof(SettingsPocoWithAllPropertyTypes) &&
                e.Name == nameof(SettingsPocoWithAllPropertyTypes.Byte) &
                e.Type == OrganizationSettingType.Number);

            Assert.Contains(entries, e =>
                e.Section == nameof(SettingsPocoWithAllPropertyTypes) &&
                e.Name == nameof(SettingsPocoWithAllPropertyTypes.Boolean) &
                e.Type == OrganizationSettingType.Boolean);
        }
    }

    internal class SettingsPocoWithNoDisplayNameAttributes
    {
        public string Anything { get; set; }
    }

    internal class SettingsPocoWithOrgSettingKeyAttribute
    {
        [OrgSettingKey("SOME")] public string Something { get; set; }
    }

    internal class SettingsPocoWithDisplayNameAttribute
    {
        [DisplayName("Anything")] public string Something { get; set; }
    }

    [DisplayName("TEST")]
    internal class SettingsPocoWithAllAttributes
    {
        [DisplayName("Anything")]
        [OrgSettingKey("SOME")]
        public string Something { get; set; }
    }

    internal class SettingsPocoWithAllPropertyTypes
    {
        public string String { get; set; }

        [EmailAddress] public string Email { get; set; }

        [Url] public string Url { get; set; }

        public int Integer { get; set; }
        public long Long { get; set; }
        public short Short { get; set; }
        public byte Byte { get; set; }

        public bool Boolean { get; set; }
    }
}
