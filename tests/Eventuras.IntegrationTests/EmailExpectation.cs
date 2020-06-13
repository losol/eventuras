using System.Collections.Generic;
using Losol.Communication.Email;
using Moq;
using Xunit;

namespace Eventuras.IntegrationTests
{
    public class EmailExpectation
    {
        private const string Placeholder = "___Placeholder___";

        private readonly Mock<IEmailSender> mock;

        private string email = Placeholder;
        private string subject = Placeholder;
        private string message = Placeholder;
        private readonly List<string> subjectContains = new List<string>();
        private readonly List<string> textContained = new List<string>();
        private bool shouldNotHaveAttachment;
        private bool shouldHaveAttachment;
        private EmailMessageType type = EmailMessageType.Html;

        public EmailExpectation(Mock<IEmailSender> mock)
        {
            this.mock = mock;
        }

        public EmailExpectation SentTo(string email)
        {
            this.email = email;
            return this;
        }

        public EmailExpectation WithSubject(string subject)
        {
            this.subject = subject;
            return this;
        }

        public EmailExpectation WithMessage(string message)
        {
            this.message = message;
            return this;
        }

        public EmailExpectation WithType(EmailMessageType type)
        {
            this.type = type;
            return this;
        }

        public EmailExpectation HavingAttachment(bool hasAttachment = true)
        {
            this.shouldHaveAttachment = hasAttachment;
            this.shouldNotHaveAttachment = !hasAttachment;
            return this;
        }

        public EmailExpectation SubjectContains(string text)
        {
            this.subjectContains.Add(text);
            return this;
        }

        public EmailExpectation ContainingText(string text)
        {
            this.textContained.Add(text);
            return this;
        }

        public EmailExpectation Setup()
        {
            this.mock.Setup(s => s.SendEmailAsync(
                    this.EmailToCheck,
                    this.SubjectToCheck,
                    this.MessageToCheck,
                    this.AttachmentToCheck,
                    this.type))
                .Callback((string email, string subject, string body, Attachment attachment, EmailMessageType emailType) =>
                {
                    foreach (var text in this.subjectContains)
                    {
                        Assert.Contains(text, subject);
                    }

                    foreach (var text in this.textContained)
                    {
                        Assert.Contains(text, body);
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