using System;
using System.Text;

namespace Eventuras.Services.Registrations.ExportService;

/// <summary>
///     Utility to get Excel column names based on column indices.
/// </summary>
public static class ExcelColumnName
{
    /// <summary>
    ///     Gets the Excel column name based on the given column index.
    /// </summary>
    /// <param name="columnIndex">The index of the column (must be greater than zero).</param>
    /// <returns>The Excel column name as a string.</returns>
    public static string GetLetters(int columnIndex)
    {
        if (columnIndex <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(columnIndex), "Column index must be greater than zero.");
        }

        var columnName = new StringBuilder();

        while (columnIndex > 0)
        {
            var remainder = (columnIndex - 1) % 26;
            var columnLetter = (char)(remainder + 'A');
            columnName.Insert(0, columnLetter);

            columnIndex = (columnIndex - remainder - 1) / 26;
        }

        return columnName.ToString();
    }
}
