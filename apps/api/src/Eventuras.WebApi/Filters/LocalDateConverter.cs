using System;
using System.Text.Json;
using System.Text.Json.Serialization;
using NodaTime;
using NodaTime.Text;

public class LocalDateConverter : JsonConverter<LocalDate?>
{
    private readonly LocalDatePattern _pattern = LocalDatePattern.CreateWithInvariantCulture("yyyy-MM-dd");

    public override LocalDate? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            var stringValue = reader.GetString();
            if (string.IsNullOrEmpty(stringValue))
            {
                return null;
            }

            var parseResult = _pattern.Parse(stringValue);
            if (parseResult.Success)
            {
                return parseResult.Value;
            }

            throw new JsonException("Invalid date format.");
        }

        return null;
    }

    public override void Write(Utf8JsonWriter writer, LocalDate? value, JsonSerializerOptions options)
    {
        if (value.HasValue)
        {
            writer.WriteStringValue(_pattern.Format(value.Value));
        }
        else
        {
            writer.WriteNullValue();
        }
    }
}
