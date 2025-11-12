using System;
using System.ComponentModel.DataAnnotations;
using System.Net.Mail;

namespace Losol.Communication.Email;

public class Address
{
    public const int MaxNameLength = 255;
    public const int MaxEmailLength = 255;

    public Address()
    {
    }

    public Address(string name, string email)
    {
        Name = name ?? throw new ArgumentNullException(nameof(name));
        Email = email ?? throw new ArgumentNullException(nameof(email));
    }

    public Address(string address)
    {
        var a = new MailAddress(address);
        Name = a.DisplayName;
        Email = a.Address;
    }

    [MaxLength(MaxNameLength)] public string Name { get; set; }

    [Required]
    [EmailAddress]
    [MaxLength(MaxEmailLength)]
    public string Email { get; set; }

    public override string ToString()
    {
        if (string.IsNullOrEmpty(Name) && string.IsNullOrEmpty(Email))
        {
            return null;
        }

        if (string.IsNullOrEmpty(Name))
        {
            return Email;
        }

        return $"{Name} <{Email}>";
    }
}
