using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using Xunit;

namespace Losol.Communication.Email.Tests;

public class EmailModelTests
{
    [Theory]
    [MemberData(nameof(InvalidEmailModels))]
    public void Should_Throw_Validation_Exception_For_Invalid_Model(EmailModel model)
    {
        Assert.Throws<ValidationException>(model.Validate);
    }

    [Theory]
    [MemberData(nameof(ValidEmailModels))]
    public void Should_Not_Throw_Validation_Exception_For_Valid_Model(EmailModel model)
    {
        model.Validate();
    }

    public static readonly string TestEmailWithMaxLength =
        "test@email.com".PadRight(Address.MaxEmailLength, 'a');

    public static readonly string TestNameWithMaxLength =
        "".PadRight(Address.MaxNameLength, 'a');

    public static readonly string TestSubjectWithMaxLength =
        "".PadRight(EmailModel.MaxSubjectLength, 'a');

    public static object[][] InvalidEmailModels = {
        new object[]{new EmailModel{Subject = "Test", TextBody = "Some text"}}, // No recipients
        new object[]{new EmailModel{Recipients = new Address[0], Subject = "Test", TextBody = "Some text"}}, // Empty recipients
        new object[]{new EmailModel{Recipients = new[]{ new Address("Test", "") }, Subject = "Test", TextBody = "Some text"}}, // No To: email
        new object[]{new EmailModel{Recipients = new[]{ new Address("test@email.com") }, TextBody = "Some text"}}, // No Subject
        new object[]{new EmailModel{Recipients = new[]{ new Address("test@email.com") }, Subject = "Test"}}, // No Message
        new object[]{new EmailModel{Recipients = new[]{ new Address("test@email.com") }, From = new Address("test", "test"), Subject = "Test", TextBody = "Test"}}, // Invalid From: email
        new object[]{new EmailModel{Recipients = new[]{ new Address("test@email.com") }, Cc = new []{ new Address("test", "test") }, Subject = "Test", TextBody = "Test"}}, // Invalid CC: email
        new object[]{new EmailModel{Recipients = new[]{ new Address("test@email.com") }, Bcc = new []{ new Address("test", "test") }, Subject = "Test", TextBody = "Test"}}, // Invalid BCC: email
        new object[]{new EmailModel{Recipients = new[]{ new Address("test@email.com") }, Subject = "Test", TextBody = "Some text", Attachments = new List<Attachment>{new Attachment{Filename = "test.txt"}}}}, // no attachment content
        new object[]{new EmailModel{Recipients = new[]{ new Address("test@email.com") }, Subject = "Test", TextBody = "Some text", Attachments = new List<Attachment>{new Attachment
        {
            Bytes = Encoding.UTF8.GetBytes("test")
        }}}}, // no attachment file name
        new object[]{new EmailModel{Recipients = new[]{ new Address("test@email.com") }, Subject = "Test", TextBody = "Some text", Attachments = new List<Attachment>{new Attachment
        {
            Bytes = Encoding.UTF8.GetBytes("test"),
            Filename = "test.txt"
        }}}}, // no attachment content type

        // Too long to/from name, email, subject
        new object[]{new EmailModel{Recipients = new[]{ new Address(TestEmailWithMaxLength + "a") }, Subject = "Test", TextBody = "Some text"}},
        new object[]{new EmailModel{Recipients = new[]{ new Address("test@email.com") }, Subject = TestSubjectWithMaxLength + "a", TextBody = "Some text"}},
        new object[]{new EmailModel{Recipients = new[]{ new Address(TestNameWithMaxLength + "a", "test@email.com") }, Subject = "Test", TextBody = "Some text"}},
        new object[]{new EmailModel{From = new Address(TestEmailWithMaxLength + "a"), Recipients = new[] { new Address("test@email.com") }, Subject = "Test", TextBody = "Some text"}},
        new object[]{new EmailModel{From = new Address(TestNameWithMaxLength + "a", "some@email.com"), Recipients = new[] { new Address("test@email.com") }, Subject = "Test", TextBody = "Some text"}},
    };

    public static object[][] ValidEmailModels = {
        new object[]{new EmailModel{Recipients = new[]{ new Address("test@email.com") }, Subject = "Test", TextBody = "Some text"}},
        new object[]{new EmailModel{Recipients = new[]{ new Address("test@email.com") }, Subject = "Test", HtmlBody = "Some html"}},
        new object[]{new EmailModel{Recipients = new[]{ new Address(TestEmailWithMaxLength) }, Subject = "Test", TextBody = "Some text"}},
        new object[]{new EmailModel{Recipients = new[]{ new Address("test@email.com") }, Subject = TestSubjectWithMaxLength, TextBody = "Some text"}},
        new object[]{new EmailModel{Recipients = new[]{ new Address(TestNameWithMaxLength, "test@email.com") }, Subject = "Test", TextBody = "Some text"}},
        new object[]{new EmailModel{Recipients = new[]{ new Address("test@email.com") }, From = new Address(TestEmailWithMaxLength), Subject = "Test", TextBody = "Some text"}},
        new object[]{new EmailModel{Recipients = new[]{ new Address("test@email.com") }, From = new Address(TestNameWithMaxLength, "some@email.com"), Subject = "Test", TextBody = "Some text"}},
        new object[]{new EmailModel{Recipients = new[]{ new Address("test@email.com") }, Cc = new []{ new Address("test", "test@email.com") }, Subject = "Test", TextBody = "Test"}}, // Invalid CC: email
        new object[]{new EmailModel{Recipients = new[]{ new Address("test@email.com") }, Bcc = new []{ new Address("test", "test@email.com") }, Subject = "Test", TextBody = "Test"}}, // Invalid BCC: email
        new object[]{new EmailModel{Recipients = new[] { new Address("test@email.com") }, Subject = "Test", TextBody = "Some text", Attachments = new List<Attachment>
            {
                new Attachment
                {
                    Filename = "test.txt",
                    Bytes = Encoding.UTF8.GetBytes("test"),
                    ContentType = "text/plain"
                }
            }}},
    };
}
