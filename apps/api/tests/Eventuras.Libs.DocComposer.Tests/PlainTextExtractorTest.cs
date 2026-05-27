using System.Threading.Tasks;
using Xunit;

namespace Eventuras.Libs.DocComposer.Tests;

public class PlainTextExtractorTest
{
    [Fact]
    public async Task ExtractAsync_PreservesLinkUrl_WhenDifferentFromText()
    {
        var html = """<p>Click <a href="https://example.com/page">here</a> to continue.</p>""";

        var text = await PlainTextExtractor.ExtractAsync(html);

        Assert.Contains("here (https://example.com/page)", text);
    }

    [Fact]
    public async Task ExtractAsync_OmitsLinkUrl_WhenSameAsText()
    {
        var html = """<a href="https://example.com">https://example.com</a>""";

        var text = await PlainTextExtractor.ExtractAsync(html);

        Assert.Equal("https://example.com", text);
    }

    [Fact]
    public async Task ExtractAsync_KeepsImageAltText_WhenPresent()
    {
        var html = """<img src="x.png" alt="Logo" />""";

        var text = await PlainTextExtractor.ExtractAsync(html);

        Assert.Equal("[Logo]", text);
    }

    [Fact]
    public async Task ExtractAsync_StripsScriptAndStyle()
    {
        var html = "<style>p { color: red; }</style><script>alert('x')</script><p>Visible</p>";

        var text = await PlainTextExtractor.ExtractAsync(html);

        Assert.Equal("Visible", text);
    }

    [Fact]
    public async Task ExtractAsync_FormatsListItems_WithDashPrefix()
    {
        var html = "<ul><li>One</li><li>Two</li></ul>";

        var text = await PlainTextExtractor.ExtractAsync(html);

        Assert.Contains("- One", text);
        Assert.Contains("- Two", text);
    }

    [Fact]
    public async Task ExtractAsync_ReturnsEmpty_WhenHtmlIsNullOrWhitespace()
    {
        Assert.Equal(string.Empty, await PlainTextExtractor.ExtractAsync(string.Empty));
        Assert.Equal(string.Empty, await PlainTextExtractor.ExtractAsync(null));
        Assert.Equal(string.Empty, await PlainTextExtractor.ExtractAsync("   "));
    }

    [Fact]
    public async Task ExtractAsync_CollapsesRepeatedWhitespace()
    {
        var html = "<p>Hello     world</p>";

        var text = await PlainTextExtractor.ExtractAsync(html);

        Assert.Equal("Hello world", text);
    }
}
