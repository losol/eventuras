using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;

namespace Eventuras.Services.Registrations.ExportService;

public static class ExcelTableBuilder
{
    // Excel limits
    private const int MaxColumns = 16384; // XFD
    private const int MaxRows = 1_048_576; // inclusive of header

    public static void DefineExcelTable(
        WorkbookPart workbookPart, // <-- pass explicitly (version-safe)
        WorksheetPart worksheetPart,
        List<ColumnConfig> columnConfig,
        int dataRowCount
    )
    {
        if (workbookPart == null)
        {
            throw new ArgumentNullException(nameof(workbookPart));
        }

        if (worksheetPart?.Worksheet == null)
        {
            throw new ArgumentNullException(nameof(worksheetPart), "WorksheetPart and Worksheet must be initialized.");
        }

        if (columnConfig == null || !columnConfig.Any())
        {
            throw new ArgumentException("Column configuration cannot be null or empty.");
        }

        if (dataRowCount <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(dataRowCount), "Data row count must be greater than zero.");
        }

        if (columnConfig.Count > MaxColumns)
        {
            throw new ArgumentOutOfRangeException(nameof(columnConfig), $"Too many columns for Excel (>{MaxColumns}).");
        }

        var lastRow = dataRowCount + 1; // +1 for header
        if (lastRow > MaxRows)
        {
            throw new ArgumentOutOfRangeException(nameof(dataRowCount), $"Too many rows for Excel (>{MaxRows}).");
        }

        // Collect ALL existing tables across the entire workbook
        var allTableDefParts = workbookPart
            .WorksheetParts
            .SelectMany(wp => wp.GetPartsOfType<TableDefinitionPart>())
            .ToList();

        // ---- Generate unique table id across the entire workbook (required by spec) ----
        var existingIds = allTableDefParts
            .Select(p => p.Table?.Id?.Value ?? 0U);
        var nextId = existingIds.Any() ? existingIds.Max() + 1U : 1U;

        // ---- Generate unique display name across the entire workbook ----
        var existingNames = allTableDefParts
            .Select(p => p.Table?.DisplayName?.Value)
            .Where(n => !string.IsNullOrWhiteSpace(n))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        static string MakeUniqueName(string baseName, uint start, HashSet<string> existing)
        {
            var i = start;
            string candidate;
            do
            {
                candidate = $"{baseName}{i++}";
            } while (existing.Contains(candidate));

            return candidate;
        }

        var tableName = MakeUniqueName("Table", nextId, existingNames);

        // ---- Create the table definition part on THIS worksheet ----
        var tableDefinitionPart = worksheetPart.AddNewPart<TableDefinitionPart>();

        var lastColumn = GetExcelColumnName(columnConfig.Count);
        var reference = $"A1:{lastColumn}{lastRow}";

        var table = new Table
        {
            Id = nextId,
            Name = tableName,
            DisplayName = tableName,
            Reference = reference,
            HeaderRowCount = 1U, // be explicit
            TableType = TableValues.Worksheet // standard worksheet table
        };

        // Children MUST be in schema order: autoFilter -> tableColumns -> tableStyleInfo
        var autoFilter = new AutoFilter { Reference = reference };

        var tableColumns = new TableColumns { Count = (uint)columnConfig.Count };
        for (var i = 0; i < columnConfig.Count; i++)
        {
            var colName = GetValidColumnName(columnConfig[i].Header, i + 1);
            tableColumns.Append(new TableColumn { Id = (uint)(i + 1), Name = colName });
        }

        var tableStyleInfo = new TableStyleInfo
        {
            Name = "TableStyleLight1",
            ShowFirstColumn = false,
            ShowLastColumn = false,
            ShowRowStripes = true,
            ShowColumnStripes = false
        };

        // Append in correct order
        table.Append(autoFilter);
        table.Append(tableColumns);
        table.Append(tableStyleInfo);

        // Attach to part
        tableDefinitionPart.Table = table;

        // ---- Hook table part into the worksheet via <tableParts> ----
        var worksheet = worksheetPart.Worksheet;

        var tableParts = worksheet.Elements<TableParts>().FirstOrDefault();
        if (tableParts == null)
        {
            tableParts = new TableParts();

            // Insert before <extLst> if present (Excel prefers this ordering)
            var extLst = worksheet.Elements<ExtensionList>().FirstOrDefault();
            if (extLst != null)
            {
                worksheet.InsertBefore(tableParts, extLst);
            }
            else
            {
                worksheet.Append(tableParts);
            }
        }

        tableParts.Append(new TablePart { Id = worksheetPart.GetIdOfPart(tableDefinitionPart) });
        tableParts.Count = (uint)tableParts.Elements<TablePart>().Count();

        worksheet.Save();
        // tableDefinitionPart.Table.Save(); // Optional
    }

    private static string GetValidColumnName(string originalName, int columnIndex)
    {
        // Guard: empty => fallback
        if (string.IsNullOrWhiteSpace(originalName))
        {
            return $"Column{columnIndex}";
        }

        // Simple sanitization to meet DisplayName rules
        var name = originalName.Trim()
            .Replace(" ", "_").Replace("-", "_").Replace(".", "_").Replace(",", "_")
            .Replace("(", "_").Replace(")", "_").Replace("/", "_").Replace("\\", "_")
            .Replace(":", "_").Replace(";", "_").Replace("'", "_").Replace("\"", "_");

        var sb = new StringBuilder();
        foreach (var c in name)
        {
            if (char.IsLetterOrDigit(c) || c == '_')
            {
                sb.Append(c);
            }
        }

        name = sb.ToString();

        // Must not start with a digit
        if (name.Length > 0 && char.IsDigit(name[0]))
        {
            name = "Col_" + name;
        }

        // Fallback if empty after sanitization
        if (string.IsNullOrEmpty(name))
        {
            name = $"Column{columnIndex}";
        }

        // Excel display names are effectively capped around 255
        if (name.Length > 255)
        {
            name = name.Substring(0, 255);
        }

        return name;
    }

    private static string GetExcelColumnName(int columnNumber)
    {
        // 1-based index to Excel letters (A, B, ..., Z, AA, AB, ...)
        var columnName = "";
        while (columnNumber > 0)
        {
            var modulo = (columnNumber - 1) % 26;
            columnName = Convert.ToChar(65 + modulo) + columnName;
            columnNumber = (columnNumber - modulo) / 26;
        }

        return columnName;
    }
}
