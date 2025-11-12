using System.ComponentModel.DataAnnotations;

namespace Losol.Communication.Email;

public class Attachment
{
    public const int MaxFileNameLength = 255;

    [Required]
    [MaxLength(MaxFileNameLength)]
    public string Filename { get; set; }

    [Required][MinLength(1)] public byte[] Bytes { get; set; }

    [Required] public string ContentType { get; set; }

    public string ContentDisposition { get; set; }

    public string ContentId { get; set; }

    public override string ToString() =>
        $"{nameof(Filename)}: {Filename}, " +
        $"{nameof(Bytes)}: ({Bytes?.Length ?? 0} bytes), " +
        $"{nameof(ContentType)}: {ContentType}, " +
        $"{nameof(ContentDisposition)}: {ContentDisposition}, " +
        $"{nameof(ContentId)}: {ContentId}";
}
