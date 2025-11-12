using Losol.Communication.Email;
using Moq;

namespace Eventuras.TestAbstractions;

public static class MockExtensions
{
    public static EmailExpectation ExpectEmail(this Mock<IEmailSender> sender) => new(sender);
}
