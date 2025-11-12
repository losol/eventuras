using System.Linq;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;

namespace Eventuras.Services.Registrations.ExportService;

public static class ExcelSheetHelper
{
    public static void AddUniqueSheet(WorkbookPart workbookPart, WorksheetPart worksheetPart, string sheetName)
    {
        var sheets = workbookPart.Workbook.GetFirstChild<Sheets>();

        if (sheets == null)
        {
            sheets = new Sheets();
            workbookPart.Workbook.AppendChild(sheets);
        }

        // Find the maximum existing SheetId (handle null safely)
        uint maxSheetId = 0;
        if (sheets.ChildElements.OfType<Sheet>().Any())
        {
            maxSheetId = sheets.ChildElements
                .OfType<Sheet>()
                .Select(sheet => sheet.SheetId.Value)
                .Max();
        }

        // Increment to get a unique SheetId
        var newSheet = new Sheet
        {
            Id = workbookPart.GetIdOfPart(worksheetPart), SheetId = maxSheetId + 1, Name = sheetName
        };

        sheets.Append(newSheet);
    }
}
