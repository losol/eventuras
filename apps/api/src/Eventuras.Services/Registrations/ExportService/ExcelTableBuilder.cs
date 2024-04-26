using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;

namespace Eventuras.Services.Registrations.ExportService;

public static class ExcelTableBuilder
{
    public static void DefineExcelTable(
        WorksheetPart worksheetPart,
        List<ColumnConfig> columnConfig,
        int dataRowCount
    )
    {
        if (worksheetPart == null)
        {
            throw new ArgumentNullException(nameof(worksheetPart), "WorksheetPart must be initialized.");
        }

        if (columnConfig == null || !columnConfig.Any())
        {
            throw new ArgumentException("Column configuration cannot be null or empty.");
        }

        if (dataRowCount <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(dataRowCount), "Data row count must be greater than zero.");
        }


        uint nextTableId = (uint)worksheetPart.GetPartsOfType<TableDefinitionPart>().Count() + 1;

        var table = new Table
        {
            Id = nextTableId,
            Name = "ParticipantList",
            Reference = $"A1:{ExcelColumnName.GetLetters(columnConfig.Count)}{dataRowCount + 1}",
        };

        var tableStyleInfo = new TableStyleInfo
        {
            Name = "TableStyleMedium9",
            ShowFirstColumn = true,
            ShowLastColumn = true,
            ShowRowStripes = true,
            ShowColumnStripes = true,
        };

        table.AppendChild(tableStyleInfo);

        var tableColumns = new TableColumns { Count = (uint)columnConfig.Count };

        uint columnIndex = 1;
        foreach (var config in columnConfig)
        {
            var tableColumn = new TableColumn
            {
                Id = columnIndex,
                Name = config.Header ?? $"Column{columnIndex}"
            };

            tableColumns.Append(tableColumn);
            columnIndex++;
        }

        table.Append(tableColumns);

        var tableDefinitionPart = worksheetPart.GetPartsOfType<TableDefinitionPart>().FirstOrDefault()
                       ?? worksheetPart.AddNewPart<TableDefinitionPart>();
        tableDefinitionPart.Table = table;

        tableDefinitionPart.Table.Save();
    }
}
