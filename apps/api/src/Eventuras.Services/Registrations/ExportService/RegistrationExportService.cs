using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using Eventuras.Domain;
using Microsoft.Extensions.Logging;

namespace Eventuras.Services.Registrations.ExportService;

public class RegistrationExportService : IRegistrationExportService
{
    private readonly IRegistrationRetrievalService _registrationRetrievalService;
    private readonly ILogger<RegistrationExportService> _logger;

    public RegistrationExportService(IRegistrationRetrievalService registrationRetrievalService,
        ILogger<RegistrationExportService> logger)
    {
        _registrationRetrievalService = registrationRetrievalService ??
                                        throw new ArgumentNullException(nameof(registrationRetrievalService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task ExportParticipantListToExcelAsync(
        Stream stream,
        RegistrationListRequest request)
    {
        if (stream == null)
        {
            throw new ArgumentNullException(nameof(stream), "Stream cannot be null.");
        }

        if (request == null)
        {
            throw new ArgumentNullException(nameof(request), "Registration request cannot be null.");
        }

        _logger.LogInformation("Exporting participant list to Excel");

        try
        {
            using var spreadsheetDocument = SpreadsheetDocument.Create(
                stream,
                SpreadsheetDocumentType.Workbook
            );

            var workbookPart = spreadsheetDocument.AddWorkbookPart();
            workbookPart.Workbook = new Workbook();

            var worksheetPart = workbookPart.AddNewPart<WorksheetPart>();

            // Create worksheet FIRST, before adding data
            worksheetPart.Worksheet = new Worksheet();
            var sheetData = new SheetData();
            worksheetPart.Worksheet.AppendChild(sheetData);

            var columnConfig = ColumnConfig.GetDefaultConfig();
            WriteHeaderRow(sheetData, columnConfig);

            // Write data rows
            var reader = RegistrationPageReaderFactory.CreateRegistrationPageReader(
                _registrationRetrievalService,
                request
            );

            var dataRowCount = 0;
            while (await reader.HasMoreAsync())
            {
                var registrations = await reader.ReadNextAsync();
                foreach (var registration in registrations)
                {
                    var products = await _registrationRetrievalService.GetRegistrationProductsAsync(registration);
                    WriteDataRow(sheetData, registration, products);
                    dataRowCount++;
                }
            }

            // Add unique sheet BEFORE creating table
            ExcelSheetHelper.AddUniqueSheet(workbookPart, worksheetPart, "Participants");

            // Only create table if we have data
            if (dataRowCount > 0)
            {
                try
                {
                    ExcelTableBuilder.DefineExcelTable(workbookPart, worksheetPart, columnConfig, dataRowCount);
                }
                catch (Exception tableEx)
                {
                    _logger.LogWarning(tableEx, "Failed to create Excel table, continuing without table formatting");
                    // Continue without table - the data will still be there
                }
            }

            // Save the workbook
            workbookPart.Workbook.Save();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while exporting the participant list to Excel.");
            throw;
        }
    }

    private static void ValidateSheetData(SheetData sheetData)
    {
        if (sheetData == null)
        {
            throw new ArgumentNullException(nameof(sheetData), "SheetData cannot be null.");
        }
    }

    private static void ValidateColumnConfig(List<ColumnConfig> columns)
    {
        if (columns == null || columns.Count == 0)
        {
            throw new ArgumentException("Column configuration cannot be null or empty.", nameof(columns));
        }
    }

    private static void AppendRowToSheet(SheetData sheetData, List<string> cellValues)
    {
        ValidateSheetData(sheetData);

        var row = new Row();

        foreach (var value in cellValues)
        {
            row.Append(new Cell
            {
                CellValue = new CellValue(string.IsNullOrWhiteSpace(value) ? "" : value),
                DataType = CellValues.String
            });
        }

        sheetData.Append(row);
    }

    private static void WriteHeaderRow(SheetData sheetData, List<ColumnConfig> columns)
    {
        ValidateColumnConfig(columns);

        var headerValues = columns.Select(column => column.Header).ToList();

        AppendRowToSheet(sheetData, headerValues);
    }

    private static void WriteDataRow(SheetData sheetData, Registration registration, List<RegistrationProductDto> products)
    {
        ValidateSheetData(sheetData);

        var config = ColumnConfig.GetDefaultConfig();

        if (config == null || config.Count == 0)
        {
            throw new InvalidOperationException("Column configuration cannot be null or empty.");
        }

        var dataValues = config.Select(column =>
        {
            // Special handling for Products column
            if (column.Header == "Products")
            {
                return ColumnConfig.FormatProducts(products);
            }
            return column.DataExtractor(registration);
        }).ToList();

        AppendRowToSheet(sheetData, dataValues);
    }
}
