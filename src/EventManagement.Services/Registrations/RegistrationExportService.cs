using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Services.Registrations
{
    public class RegistrationExportService : IRegistrationExportService
    {
        private readonly IRegistrationRetrievalService _registrationRetrievalService;

        public RegistrationExportService(IRegistrationRetrievalService registrationRetrievalService)
        {
            _registrationRetrievalService = registrationRetrievalService ??
                                            throw new ArgumentNullException(nameof(registrationRetrievalService));
        }

        public async Task ExportParticipantListToExcelAsync(Stream stream, IRegistrationExportService.Options options = null)
        {
            using var spreadsheetDocument = SpreadsheetDocument.Create(stream, SpreadsheetDocumentType.Workbook);

            var workbookPart = spreadsheetDocument.AddWorkbookPart();
            workbookPart.Workbook = new Workbook();

            var worksheetPart = workbookPart.AddNewPart<WorksheetPart>();
            var sheetData = new SheetData();

            var registrations = await PageReader<Registration>.ReadAllAsync(async (offset, limit, token) =>
                await _registrationRetrievalService.ListRegistrationsAsync(
                    new IRegistrationRetrievalService.Request
                    {
                        Offset = offset,
                        Limit = limit,
                        EventInfoId = options?.EventInfoId,
                        IncludingUser = true,
                        IncludingEventInfo = true,
                        IncludingOrders = true,
                        IncludingProducts = true,
                        OrderBy = IRegistrationRetrievalService.Order.RegistrationTime,
                        Descending = true
                    }, token));


            if (options?.ExportHeader == true)
            {
                WriteHeader(sheetData);
            }

            foreach (var registration in registrations)
            {
                WriteRow(sheetData, registration);
            }

            worksheetPart.Worksheet = new Worksheet(sheetData);
            workbookPart.Workbook.Save();
        }

        private static void WriteHeader(SheetData sheetData)
        {
            var row = new Row();
            foreach (var header in new[]
            {
                "RegistrationId",
                "ParticipantName",
                "ParticipantEmail",
                "ParticipantPhone",
                "Products",
                "RegistrationStatus",
                "RegistrationType"
            })
            {
                row.Append(new Cell
                {
                    CellValue = new CellValue(header),
                    DataType = new EnumValue<CellValues>(CellValues.String)
                });
            }
            sheetData.Append(row);
        }

        private static void WriteRow(SheetData sheetData, Registration registration)
        {
            var row = new Row();
            row.Append(
                new Cell
                {
                    CellValue = new CellValue(registration.RegistrationId.ToString()),
                    DataType = new EnumValue<CellValues>(CellValues.String)
                },
                new Cell
                {
                    CellValue = new CellValue(registration.ParticipantName),
                    DataType = new EnumValue<CellValues>(CellValues.String)
                },
                new Cell
                {
                    CellValue = new CellValue(registration.User.Email),
                    DataType = new EnumValue<CellValues>(CellValues.String)
                },
                new Cell
                {
                    CellValue = new CellValue(registration.User.PhoneNumber),
                    DataType = new EnumValue<CellValues>(CellValues.String)
                },
                new Cell
                {
                    CellValue = new CellValue(string.Join(", ", registration.Products.Select(p =>
                    {
                        var str = new StringBuilder();
                        if (p.Quantity > 1)
                        {
                            str.Append($"{p.Quantity} × {p.Product.Name}");
                        }
                        else
                        {
                            str.Append(p.Product.Name);
                        }
                        if (p.Variant != null)
                        {
                            str.Append($" ({p.Variant.Name})");
                        }
                        return str.ToString();
                    }))),
                    DataType = new EnumValue<CellValues>(CellValues.String)
                },
                new Cell
                {
                    CellValue = new CellValue(registration.Status.ToString()),
                    DataType = new EnumValue<CellValues>(CellValues.String)
                },
                new Cell
                {
                    CellValue = new CellValue(registration.Type.ToString()),
                    DataType = new EnumValue<CellValues>(CellValues.String)
                });
            sheetData.Append(row);
        }
    }
}
