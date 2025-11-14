using System.IO;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;

namespace Eventuras.WebApi.Tests.TestHelpers;

/// <summary>
/// Generates minimal valid PDF documents for testing purposes using iText.
/// The generated PDFs contain the specified content and can be verified in tests.
/// </summary>
public static class MinimalPdfGenerator
{
    /// <summary>
    /// Generates a minimal valid PDF stream containing the specified text content.
    /// </summary>
    /// <param name="title">The title text to include in the PDF</param>
    /// <param name="recipientName">The recipient name to include in the PDF</param>
    /// <returns>A memory stream containing a valid PDF document</returns>
    public static Stream Generate(string title, string recipientName)
    {
        var memoryStream = new MemoryStream();

        // Use a wrapper stream that prevents closing the underlying stream
        using (var nonClosingStream = new NonClosingStream(memoryStream))
        {
            var writer = new PdfWriter(nonClosingStream);
            var pdf = new PdfDocument(writer);
            var document = new Document(pdf);

            document.Add(new Paragraph(title));
            document.Add(new Paragraph(recipientName));

            document.Close();
        }

        memoryStream.Position = 0;
        return memoryStream;
    }

    /// <summary>
    /// A stream wrapper that prevents the underlying stream from being closed.
    /// </summary>
    private class NonClosingStream : Stream
    {
        private readonly Stream _baseStream;

        public NonClosingStream(Stream baseStream)
        {
            _baseStream = baseStream;
        }

        public override bool CanRead => _baseStream.CanRead;
        public override bool CanSeek => _baseStream.CanSeek;
        public override bool CanWrite => _baseStream.CanWrite;
        public override long Length => _baseStream.Length;
        public override long Position
        {
            get => _baseStream.Position;
            set => _baseStream.Position = value;
        }

        public override void Flush() => _baseStream.Flush();
        public override int Read(byte[] buffer, int offset, int count) => _baseStream.Read(buffer, offset, count);
        public override long Seek(long offset, SeekOrigin origin) => _baseStream.Seek(offset, origin);
        public override void SetLength(long value) => _baseStream.SetLength(value);
        public override void Write(byte[] buffer, int offset, int count) => _baseStream.Write(buffer, offset, count);

        // Override Close to do nothing - this keeps the underlying stream open
        public override void Close()
        {
            // Intentionally do nothing
        }

        protected override void Dispose(bool disposing)
        {
            // Intentionally do not dispose the base stream
        }
    }
}
