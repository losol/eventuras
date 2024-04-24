using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using Eventuras.Domain;

namespace Eventuras.Services.Registrations;

public class RegistrationExportService : IRegistrationExportService
{
    private readonly IRegistrationRetrievalService _registrationRetrievalService;

    public RegistrationExportService(IRegistrationRetrievalService registrationRetrievalService)
    {
        _registrationRetrievalService = registrationRetrievalService ??
                                        throw new ArgumentNullException(nameof(registrationRetrievalService));
    }

    public async Task ExportParticipantListToExcelAsync(
        Stream stream,
        RegistrationListRequest request)
    {
        using var spreadsheetDocument = SpreadsheetDocument.Create(stream,
            SpreadsheetDocumentType.Workbook);

        var workbookPart = spreadsheetDocument.AddWorkbookPart();
        workbookPart.Workbook = new Workbook();

        var worksheetPart = workbookPart.AddNewPart<WorksheetPart>();
        var sheetData = new SheetData();

        // Always write the header first
        WriteHeader(sheetData);

        // PageReader for reading data
        var reader = new PageReader<Registration>(async (offset, limit, token) =>
            await _registrationRetrievalService.ListRegistrationsAsync(
                new RegistrationListRequest
                {
                    Offset = offset,
                    Limit = limit,
                    OrderBy = RegistrationListOrder.RegistrationTime,
                    Descending = true,
                    Filter = new RegistrationFilter
                    {
                        EventInfoId = request.Filter.EventInfoId
                    }
                },
                new RegistrationRetrievalOptions
                {
                    LoadUser = true,
                    LoadEventInfo = true,
                    LoadOrders = true,
                    LoadProducts = true,
                },
                token));

        // Write data rows after headers
        while (await reader.HasMoreAsync())
        {
            foreach (var registration in await reader.ReadNextAsync())
            {
                WriteRow(sheetData, registration);
            }
        }

        worksheetPart.Worksheet = new Worksheet(sheetData);

        // Add sheets and finalize workbook
        var sheets = workbookPart.Workbook.AppendChild(new Sheets());

        sheets.Append(new Sheet
        {
            Id = spreadsheetDocument.WorkbookPart.GetIdOfPart(worksheetPart),
            SheetId = 1,
            Name = "Participants"
        });

        workbookPart.Workbook.Save();
    }

    private static void WriteHeader(SheetData sheetData)
    {
        var row = new Row();

        var config = ExportColumnConfig.GetDefaultConfig(); // Get header config

        foreach (var headerConfig in config)
        {
            row.Append(new Cell
            {
                CellValue = new CellValue(headerConfig.Header),
                DataType = new EnumValue<CellValues>(CellValues.String)
            });
        }

        sheetData.Append(row); // Append header row
    }

    private static void WriteRow(SheetData sheetData, Registration registration)
    {
        var row = new Row();

        var config = ExportColumnConfig.GetDefaultConfig(); // Get data config

        foreach (var dataConfig in config)
        {
            var cellValue = dataConfig.DataExtractor(registration); // Get data from Registration

            row.Append(new Cell
            {
                CellValue = new CellValue(cellValue),
                DataType = new EnumValue<CellValues>(CellValues.String)
            });
        }

        sheetData.Append(row); // Append data row
    }
}
