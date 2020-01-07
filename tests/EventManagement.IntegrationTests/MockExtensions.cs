using Losol.Communication.Email;
using Moq;

namespace losol.EventManagement.IntegrationTests
{
    public static class MockExtensions
    {
        public static EmailExpectation ExpectEmail(this Mock<IEmailSender> sender)
        {
            return new EmailExpectation(sender);
        }
    }
}
