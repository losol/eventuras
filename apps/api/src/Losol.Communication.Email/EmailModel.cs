using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace Losol.Communication.Email;

public class EmailModel
{
    public const int MaxSubjectLength = 255;
    public const int MaxRecipients = 500;
    public const int MaxCc = 500;
    public const int MaxBcc = 500;

    private List<Attachment> _attachments;

    [CheckChildren] public Address From { get; set; }

    [Required]
    [MinLength(1)]
    [MaxLength(MaxRecipients)]
    [CheckChildren]
    public Address[] Recipients { get; set; }

    [MaxLength(MaxCc)] [CheckChildren] public Address[] Cc { get; set; }

    [MaxLength(MaxBcc)] [CheckChildren] public Address[] Bcc { get; set; }

    [Required]
    [MaxLength(MaxSubjectLength)]
    public string Subject { get; set; }

    public string TextBody { get; set; }

    public string HtmlBody { get; set; }

    [CheckChildren]
    public List<Attachment> Attachments
    {
        get => _attachments ??= new List<Attachment>();
        set => _attachments = value;
    }

    public override string ToString() =>
        $"{nameof(From)}: {From}, " +
        $"{nameof(Recipients)}: {string.Join(", ", Recipients?.Select(a => a.ToString()) ?? Array.Empty<string>())}, " +
        $"{nameof(Cc)}: {string.Join(", ", Cc?.Select(a => a.ToString()) ?? Array.Empty<string>())}, " +
        $"{nameof(Bcc)}: {string.Join(", ", Bcc?.Select(a => a.ToString()) ?? Array.Empty<string>())}, " +
        $"{nameof(Subject)}: {Subject}, " +
        $"{nameof(TextBody)}: {TextBody}, " +
        $"{nameof(HtmlBody)}: {HtmlBody}, " +
        $"{nameof(Attachments)}: {string.Join(", ", Attachments?.Select(a => a.ToString()) ?? Array.Empty<string>())}";

    private static string FormatEmailAddress(string name, string email)
    {
        if (string.IsNullOrEmpty(name) && string.IsNullOrEmpty(email))
        {
            return null;
        }

        if (string.IsNullOrEmpty(name))
        {
            return email;
        }

        return $"{name} <{email}>";
    }
}
