using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using AngleSharp;
using AngleSharp.Dom;

namespace Eventuras.Libs.DocComposer;

public static class PlainTextExtractor
{
    private static readonly HashSet<string> SkippedTags = new(StringComparer.OrdinalIgnoreCase)
    {
        "script", "style", "head", "title", "meta", "link", "noscript"
    };

    private static readonly HashSet<string> BlockTags = new(StringComparer.OrdinalIgnoreCase)
    {
        "p", "div", "section", "article", "header", "footer", "main",
        "h1", "h2", "h3", "h4", "h5", "h6",
        "ul", "ol", "table", "tr", "blockquote", "pre"
    };

    public static async Task<string> ExtractAsync(string? html, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(html))
        {
            return string.Empty;
        }

        var context = BrowsingContext.New(Configuration.Default);
        var document = await context.OpenAsync(req => req.Content(html), cancellationToken);

        INode root = document.Body ?? (INode)document.DocumentElement;
        return ExtractFromNode(root);
    }

    public static string ExtractFromNode(INode node)
    {
        ArgumentNullException.ThrowIfNull(node);

        var builder = new StringBuilder();
        WriteNode(node, builder);
        return Normalize(builder.ToString());
    }

    private static void WriteNode(INode node, StringBuilder sb)
    {
        switch (node.NodeType)
        {
            case NodeType.Text:
                sb.Append(node.TextContent);
                return;

            case NodeType.Element:
                WriteElement((IElement)node, sb);
                return;

            case NodeType.Document:
            case NodeType.DocumentFragment:
                foreach (var child in node.ChildNodes)
                {
                    WriteNode(child, sb);
                }
                return;
        }
    }

    private static void WriteElement(IElement element, StringBuilder sb)
    {
        var tag = element.LocalName;

        if (SkippedTags.Contains(tag))
        {
            return;
        }

        switch (tag)
        {
            case "br":
                sb.Append('\n');
                return;

            case "hr":
                EnsureNewline(sb);
                sb.Append("---\n");
                return;

            case "a":
                var hrefStart = sb.Length;
                WriteChildren(element, sb);
                var href = element.GetAttribute("href");
                if (!string.IsNullOrWhiteSpace(href))
                {
                    var linkText = sb.ToString(hrefStart, sb.Length - hrefStart).Trim();
                    if (!string.Equals(linkText, href, StringComparison.Ordinal))
                    {
                        sb.Append(" (").Append(href).Append(')');
                    }
                }
                return;

            case "img":
                var alt = element.GetAttribute("alt");
                if (!string.IsNullOrWhiteSpace(alt))
                {
                    sb.Append('[').Append(alt).Append(']');
                }
                return;

            case "li":
                EnsureNewline(sb);
                sb.Append("- ");
                WriteChildren(element, sb);
                EnsureNewline(sb);
                return;

            case "td":
            case "th":
                WriteChildren(element, sb);
                sb.Append('\t');
                return;
        }

        if (BlockTags.Contains(tag))
        {
            EnsureNewline(sb);
            WriteChildren(element, sb);
            EnsureNewline(sb);
            return;
        }

        WriteChildren(element, sb);
    }

    private static void WriteChildren(IElement element, StringBuilder sb)
    {
        foreach (var child in element.ChildNodes)
        {
            WriteNode(child, sb);
        }
    }

    private static void EnsureNewline(StringBuilder sb)
    {
        if (sb.Length > 0 && sb[^1] != '\n')
        {
            sb.Append('\n');
        }
    }

    private static string Normalize(string text)
    {
        var lines = text.Split('\n');
        var builder = new StringBuilder();
        var blankLines = 0;

        foreach (var raw in lines)
        {
            var line = CollapseInlineWhitespace(raw).TrimEnd();
            if (line.Length == 0)
            {
                blankLines++;
                if (blankLines <= 1)
                {
                    builder.Append('\n');
                }
            }
            else
            {
                blankLines = 0;
                builder.Append(line).Append('\n');
            }
        }

        return builder.ToString().Trim();
    }

    private static string CollapseInlineWhitespace(string input)
    {
        var sb = new StringBuilder(input.Length);
        var inWhitespace = false;
        foreach (var c in input)
        {
            if (c is ' ' or '\t' or '\r')
            {
                if (!inWhitespace)
                {
                    sb.Append(' ');
                    inWhitespace = true;
                }
            }
            else
            {
                sb.Append(c);
                inWhitespace = false;
            }
        }
        return sb.ToString();
    }
}
