using Eventuras.Services.Invoicing;
using Eventuras.Services.PowerOffice;
using GoApi.Common;
using GoApi.Party;
using Xunit;
using static Eventuras.Domain.PaymentMethod;

namespace Eventuras.WebApi.Tests.Services.PowerOffice;

public class PowerOfficeCustomerMapperTests
{
    [Theory]
    [InlineData("974760673", "974760673")]
    [InlineData("974 760 673", "974760673")]
    [InlineData("NO 974 760 673 MVA", "974760673")]
    [InlineData("NO974760673MVA", "974760673")]
    [InlineData("  ", null)]
    [InlineData("MVA", null)]
    [InlineData(null, null)]
    public void NormalizeVatNumber_Should_Keep_Only_Digits(string? input, string? expected) =>
        Assert.Equal(expected, PowerOfficeCustomerMapper.NormalizeVatNumber(input));

    [Fact]
    public void SelectPrivateCustomerByEmail_Should_Skip_Organization_Customers()
    {
        var organization = new Customer { Name = "Oslo kommune", VatNumber = "974760673" };
        var person = new Customer { Name = "Per Hansen" };

        var selected = PowerOfficeCustomerMapper.SelectPrivateCustomerByEmail([organization, person]);

        Assert.Same(person, selected);
    }

    [Fact]
    public void SelectPrivateCustomerByEmail_Should_Return_Null_When_Only_Organizations_Match()
    {
        var organization = new Customer { Name = "Oslo kommune", VatNumber = "974760673" };

        Assert.Null(PowerOfficeCustomerMapper.SelectPrivateCustomerByEmail([organization]));
    }

    [Fact]
    public void CreateCustomer_Should_Create_Organization_Without_Person_Name()
    {
        var info = new InvoiceInfo
        {
            CustomerName = "Oslo kommune",
            CustomerEmail = "per.hansen@example.com",
            CustomerVatNumber = "NO 974 760 673 MVA",
            CustomerAddress = "Rådhusplassen 1",
            CustomerZip = "0037",
            CustomerCity = "Oslo",
            PaymentMethod = PaymentProvider.PowerOfficeEHFInvoice
        };

        var customer = PowerOfficeCustomerMapper.CreateCustomer(info);

        Assert.Equal("Oslo kommune", customer.Name);
        Assert.Equal("974760673", customer.VatNumber);
        Assert.Null(customer.FirstName);
        Assert.Null(customer.LastName);
        Assert.Equal(InvoiceDeliveryType.EHF, customer.InvoiceDeliveryType);
        Assert.Equal("per.hansen@example.com", customer.InvoiceEmailAddress);
        Assert.Equal("Rådhusplassen 1", customer.MailAddress.Address1);
        Assert.Equal("0037", customer.MailAddress.ZipCode);
    }

    [Fact]
    public void CreateCustomer_Should_Create_Person_With_Name_Split()
    {
        var info = new InvoiceInfo
        {
            CustomerName = "Kari Anne Nordmann",
            CustomerEmail = "kari@example.com",
            CustomerAddress = "",
            PaymentMethod = PaymentProvider.PowerOfficeEmailInvoice
        };

        var customer = PowerOfficeCustomerMapper.CreateCustomer(info);

        Assert.Equal("Kari Anne Nordmann", customer.Name);
        Assert.Equal("Kari", customer.FirstName);
        Assert.Equal("Anne Nordmann", customer.LastName);
        Assert.Null(customer.VatNumber);
        Assert.Null(customer.MailAddress.Address1);
        Assert.Equal(InvoiceDeliveryType.PdfByEmail, customer.InvoiceDeliveryType);
    }

    [Fact]
    public void CreateCustomer_Should_Use_Email_Delivery_For_Ehf_Without_Organization_Number()
    {
        var info = new InvoiceInfo
        {
            CustomerName = "Kari Nordmann",
            CustomerEmail = "kari@example.com",
            PaymentMethod = PaymentProvider.PowerOfficeEHFInvoice
        };

        var customer = PowerOfficeCustomerMapper.CreateCustomer(info);

        Assert.Equal(InvoiceDeliveryType.PdfByEmail, customer.InvoiceDeliveryType);
    }

    [Fact]
    public void CreateCustomer_Should_Require_Name()
    {
        var info = new InvoiceInfo { CustomerName = " " };

        Assert.Throws<InvoicingException>(() => PowerOfficeCustomerMapper.CreateCustomer(info));
    }
}
