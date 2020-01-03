using Losol.Communication.Email;
using Moq;
using System.Collections.Generic;
using Xunit;

namespace losol.EventManagement.IntegrationTests
{
    public static class MockExtensions
    {
        public static EmailMockSetup ExpectEmail(this Mock<IEmailSender> sender)
        {
            return new EmailMockSetup(sender);
        }
    }

    public class EmailMockSetup
    {
        private const string Placeholder = "___Placeholder___";

        private readonly Mock<IEmailSender> mock;

        private string email = Placeholder;
        private string subject = Placeholder;
        private string message = Placeholder;
        private readonly List<string> textContained = new List<string>();
        private bool shouldNotHaveAttachment;
        private bool shouldHaveAttachment;
        private EmailMessageType type = EmailMessageType.Html;

        public EmailMockSetup(Mock<IEmailSender> mock)
        {
            this.mock = mock;
        }

        public EmailMockSetup SentTo(string email)
        {
            this.email = email;
            return this;
        }

        public EmailMockSetup WithSubject(string subject)
        {
            this.subject = subject;
            return this;
        }

        public EmailMockSetup WithMessage(string message)
        {
            this.message = message;
            return this;
        }

        public EmailMockSetup WithType(EmailMessageType type)
        {
            this.type = type;
            return this;
        }

        public EmailMockSetup HavingAttachment(bool hasAttachment = true)
        {
            this.shouldHaveAttachment = hasAttachment;
            this.shouldNotHaveAttachment = !hasAttachment;
            return this;
        }

        public EmailMockSetup ContainingText(string text)
        {
            this.textContained.Add(text);
            return this;
        }

        public EmailMockSetup Setup()
        {
            this.mock.Setup(s => s.SendEmailAsync(
                    this.EmailToCheck,
                    this.SubjectToCheck,
                    this.MessageToCheck,
                    this.AttachmentToCheck,
                    this.type))
                .Callback((string email, string subject, string html, Attachment attachment, EmailMessageType emailType) =>
                {
                    foreach (var text in this.textContained)
                    {
                        Assert.Contains(text, html);
                    }
                });

            return this;
        }
        public void VerifyEmailSent(Times? times = null)
        {
            if (times == null)
            {
                times = Times.Once();
            }

            this.mock.Verify(s => s.SendEmailAsync(
                this.EmailToCheck,
                this.SubjectToCheck,
                this.MessageToCheck,
                this.AttachmentToCheck,
                this.type), times.Value);
        }

        private Attachment AttachmentToCheck =>
            this.shouldHaveAttachment
                ? It.IsNotNull<Attachment>()
                : this.shouldNotHaveAttachment
                    ? null
                    : It.IsAny<Attachment>();

        private string MessageToCheck => this.message != Placeholder ? this.message : It.IsAny<string>();

        private string SubjectToCheck => this.subject != Placeholder ? this.subject : It.IsAny<string>();

        private string EmailToCheck => this.email != Placeholder ? this.email : It.IsAny<string>();
    }
}
