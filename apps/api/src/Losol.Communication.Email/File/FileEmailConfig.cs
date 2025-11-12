using System.ComponentModel.DataAnnotations;

namespace Losol.Communication.Email.File;

public class FileEmailConfig
{
    [Required]
    public string FilePath { get; set; }
}
