using System;
using System.Collections;
using System.Collections.Concurrent;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using Fluid;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;

namespace Eventuras.Libs.DocComposer;

public sealed class FluidDocumentComposer : IDocumentComposer
{
    private const string TemplateExtension = ".liquid";

    private readonly DocComposerOptions _options;
    private readonly string _normalizedDefaultLocale;
    private readonly FluidParser _parser;
    private readonly TemplateOptions _templateOptions;
    private readonly ConcurrentDictionary<Type, byte> _registeredModelTypes = new();

    public FluidDocumentComposer(IOptions<DocComposerOptions> options)
    {
        _options = options.Value;
        if (_options.TemplateFileProvider is null)
        {
            throw new InvalidOperationException(
                $"{nameof(DocComposerOptions.TemplateFileProvider)} must be configured.");
        }

        if (string.IsNullOrWhiteSpace(_options.DefaultLocale))
        {
            throw new InvalidOperationException(
                $"{nameof(DocComposerOptions.DefaultLocale)} must be a non-empty value.");
        }

        _normalizedDefaultLocale = NormalizeLocale(_options.DefaultLocale);
        _parser = new FluidParser();
        _templateOptions = new TemplateOptions();
    }

    public async Task<RenderedDocument> ComposeAsync<TModel>(
        string templateName,
        TModel model,
        string locale,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(templateName);
        ArgumentException.ThrowIfNullOrWhiteSpace(locale);

        var templateSource = await LoadTemplateSourceAsync(templateName, locale, cancellationToken);
        var template = _parser.Parse(templateSource);

        RegisterModelType(typeof(TModel));
        var context = new TemplateContext(model, _templateOptions);
        var html = await template.RenderAsync(context);

        return new RenderedDocument(html);
    }

    // Register the model type and, recursively, its nested complex types and
    // collection element types so templates can access members of nested objects
    // (e.g. a list of order lines). System/primitive types are skipped.
    private void RegisterModelType(Type modelType)
    {
        if (modelType == null)
        {
            return;
        }

        var underlying = Nullable.GetUnderlyingType(modelType);
        if (underlying != null)
        {
            RegisterModelType(underlying);
            return;
        }

        if (modelType != typeof(string) && typeof(IEnumerable).IsAssignableFrom(modelType))
        {
            var elementType = modelType.IsArray
                ? modelType.GetElementType()
                : modelType.IsGenericType
                    ? modelType.GetGenericArguments().FirstOrDefault()
                    : null;
            if (elementType != null)
            {
                RegisterModelType(elementType);
            }

            return;
        }

        if (!IsComplexUserType(modelType) || !_registeredModelTypes.TryAdd(modelType, 0))
        {
            return;
        }

        _templateOptions.MemberAccessStrategy.Register(modelType);

        foreach (var property in modelType.GetProperties(BindingFlags.Public | BindingFlags.Instance))
        {
            RegisterModelType(property.PropertyType);
        }
    }

    private static bool IsComplexUserType(Type type)
    {
        if (type.IsPrimitive || type.IsEnum)
        {
            return false;
        }

        if (type == typeof(string) || type == typeof(decimal) || type == typeof(Guid)
            || type == typeof(DateTime) || type == typeof(DateTimeOffset) || type == typeof(TimeSpan))
        {
            return false;
        }

        return !(type.Namespace?.StartsWith("System", StringComparison.Ordinal) ?? false);
    }

    private async Task<string> LoadTemplateSourceAsync(string templateName, string locale, CancellationToken cancellationToken)
    {
        var fileProvider = _options.TemplateFileProvider!;
        var normalizedLocale = NormalizeLocale(locale);

        var primaryPath = BuildPath(templateName, normalizedLocale);
        var primary = fileProvider.GetFileInfo(primaryPath);
        if (primary.Exists)
        {
            return await ReadAllTextAsync(primary, cancellationToken);
        }

        if (!string.Equals(normalizedLocale, _normalizedDefaultLocale, StringComparison.Ordinal))
        {
            var fallbackPath = BuildPath(templateName, _normalizedDefaultLocale);
            var fallback = fileProvider.GetFileInfo(fallbackPath);
            if (fallback.Exists)
            {
                return await ReadAllTextAsync(fallback, cancellationToken);
            }
        }

        throw new FileNotFoundException(
            $"Template '{templateName}' not found for locale '{locale}' or default locale '{_options.DefaultLocale}'.",
            primaryPath);
    }

    private static string NormalizeLocale(string locale) =>
        locale.Trim().ToLowerInvariant();

    private static string BuildPath(string templateName, string locale) =>
        string.Create(CultureInfo.InvariantCulture, $"{templateName}.{locale}{TemplateExtension}");

    private static async Task<string> ReadAllTextAsync(IFileInfo fileInfo, CancellationToken cancellationToken)
    {
        await using var stream = fileInfo.CreateReadStream();
        using var reader = new StreamReader(stream);
        return await reader.ReadToEndAsync(cancellationToken);
    }
}
