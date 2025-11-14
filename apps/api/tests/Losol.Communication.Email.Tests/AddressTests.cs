using Xunit;

namespace Losol.Communication.Email.Tests;

public class AddressTests
{
    [Theory]
    [MemberData(nameof(AddressParseData))]
    public void Should_Parse_Address(string address, string nameExpected, string emailExpected)
    {
        var a = new Address(address);
        Assert.Equal(nameExpected, a.Name);
        Assert.Equal(emailExpected, a.Email);
    }

    [Theory]
    [MemberData(nameof(AddressFormatData))]
    public void Should_Format_Address(string name, string email, string addressExpected)
    {
        var a = new Address
        {
            Name = name,
            Email = email
        };
        Assert.Equal(addressExpected, a.ToString());
    }

    public static object[][] AddressParseData = {
        new object[]{"Test <test@email.com>", "Test", "test@email.com"},
        new object[]{"Test Person <test@email.com>", "Test Person", "test@email.com"},
        new object[]{"<test@email.com>", "", "test@email.com"},
        new object[]{"test@email.com", "", "test@email.com"}
    };

    public static object[][] AddressFormatData = {
        new object[]{"Test", "test@email.com", "Test <test@email.com>"},
        new object[]{"Test Person", "test@email.com", "Test Person <test@email.com>"},
        new object[]{"", "test@email.com", "test@email.com"},
        new object[]{null, "test@email.com", "test@email.com"}
    };
}
