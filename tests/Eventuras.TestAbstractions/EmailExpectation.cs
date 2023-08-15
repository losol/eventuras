using System;
using System.Collections.Generic;
using System.Linq;
using Losol.Communication.Email;
using Moq;

namespace Eventuras.TestAbstractions;

public class EmailExpectation
{
    private const string Placeholder = "___Placeholder___";

    private readonly Mock<IEmailSender> _mock;

    private string _email = Placeholder;
    private string _subject = Placeholder;
    private string _message = Placeholder;
    private readonly List<string> _subjectContains = new();
    private readonly List<string> _htmlContained = new();
    private bool _shouldNotHaveAttachment;
    private bool _shouldHaveAttachment;

    public EmailExpectation(Mock<IEmailSender> mock)
    {
        _mock = mock;
    }

    public EmailExpectation SentTo(string email)
    {
        _email = email;
        return this;
    }

    public EmailExpectation WithSubject(string subject)
    {
        _subject = subject;
        return this;
    }

    public EmailExpectation WithMessage(string message)
    {
        _message = message;
        return this;
    }

    public EmailExpectation HavingAttachment(bool hasAttachment = true)
    {
        _shouldHaveAttachment = hasAttachment;
        _shouldNotHaveAttachment = !hasAttachment;
        return this;
    }

    public EmailExpectation SubjectContains(string text)
    {
        _subjectContains.Add(text);
        return this;
    }

    public EmailExpectation ContainingHtml(string html)
    {
        _htmlContained.Add(html);
        return this;
    }

    public EmailExpectation Setup()
    {
        _mock.Setup(s => s.SendEmailAsync(It.IsAny<EmailModel>()));
        return this;
    }

    public void VerifyEmailSent(Times? times = null)
    {
        if (times == null) times = Times.Once();

        Func<EmailModel, bool> compareFunc = m =>
        {
            if (!Placeholder.Equals(_email) && m.Recipients.All(r => r.Email != _email)) return false;

            if (!Placeholder.Equals(_subject) && m.Subject != _subject) return false;

            if (!Placeholder.Equals(_message) && (m.TextBody ?? m.HtmlBody).Equals(_message)) return false;

            if (_subjectContains.Any() && !_subjectContains.Any(s => m.Subject.Contains(s))) return false;

            if (_htmlContained.Any() && _htmlContained.All(s => m.HtmlBody?.Contains(s) != true)) return false;

            if (_shouldHaveAttachment && !m.Attachments.Any()) return false;

            if (_shouldNotHaveAttachment && m.Attachments.Any()) return false;

            return true;
        };

        _mock.Verify(s => s.SendEmailAsync(It.Is<EmailModel>(m => compareFunc(m))), times.Value);
    }
}