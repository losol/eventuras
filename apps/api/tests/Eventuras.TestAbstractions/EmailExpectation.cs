using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Losol.Communication.Email;
using Moq;

namespace Eventuras.TestAbstractions;

public class EmailExpectation
{
    private const string Placeholder = "Placeholder";
    private readonly List<string> _htmlContained = new();

    private readonly Mock<IEmailSender> _mock;
    private readonly List<string> _subjectContains = new();

    private string _email = "test@test.com";
    private string _message = Placeholder;
    private bool _shouldHaveAttachment;
    private bool _shouldNotHaveAttachment;
    private string _subject = Placeholder;

    private int _invocationCountAtSetup;

    public EmailExpectation(Mock<IEmailSender> mock) => _mock = mock;

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
        _invocationCountAtSetup = _mock.Invocations.Count;
        _mock.Setup(s => s.SendEmailAsync(It.IsAny<EmailModel>(), It.IsAny<EmailOptions>()));
        return this;
    }

    /// <summary>
    /// Waits for a new email invocation by polling the mock.
    /// Compares against the invocation count captured at Setup() time
    /// to avoid matching invocations from previous tests.
    /// </summary>
    public async Task WaitForEmailSentAsync(int timeoutMs = 5000, int pollIntervalMs = 50)
    {
        var sw = Stopwatch.StartNew();
        while (sw.ElapsedMilliseconds < timeoutMs)
        {
            if (_mock.Invocations.Count > _invocationCountAtSetup)
            {
                return;
            }

            await Task.Delay(pollIntervalMs);
        }
    }

    public void VerifyEmailSent(Times? times = null)
    {
        if (times == null)
        {
            times = Times.Once();
        }

        Func<EmailModel, bool> compareFunc = m =>
        {
            if (!Placeholder.Equals(_email) && m.Recipients.All(r => r.Email != _email))
            {
                Debug.WriteLine($"Expected email: {_email}, actual: {m.Recipients.First().Email}");
                return false;
            }

            if (!Placeholder.Equals(_subject) && m.Subject != _subject)
            {
                Debug.WriteLine($"Expected subject: {_subject}, actual: {m.Subject}");
                return false;
            }

            if (!Placeholder.Equals(_message) && (m.TextBody ?? m.HtmlBody).Equals(_message))
            {
                Debug.WriteLine($"Expected message: {_message}, actual: {m.TextBody ?? m.HtmlBody}");
                return false;
            }

            if (_subjectContains.Any() && !_subjectContains.Any(s => m.Subject.Contains(s)))
            {
                Debug.WriteLine(
                    $"Expected subject to contain: {string.Join(", ", _subjectContains)}, actual: {m.Subject}");
                return false;
            }

            if (_htmlContained.Any() && _htmlContained.All(s => m.HtmlBody?.Contains(s) != true))
            {
                Debug.WriteLine(
                    $"Expected html to contain: {string.Join(", ", _htmlContained)}, actual: {m.HtmlBody}");
                return false;
            }

            if (_shouldHaveAttachment && !m.Attachments.Any())
            {
                Debug.WriteLine("Expected attachment, but none found");
                return false;
            }

            if (_shouldNotHaveAttachment && m.Attachments.Any())
            {
                Debug.WriteLine("Expected no attachment, but found one");
                return false;
            }

            return true;
        };


        _mock.Verify(s => s
                .SendEmailAsync(
                    It.Is<EmailModel>(m => compareFunc(m)),
                    It.IsAny<EmailOptions>()),
            times.Value);
    }
}
