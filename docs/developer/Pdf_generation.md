# Configure PDF generation

The PDF generation is done by the `apps/convertoapi` app.

## Installation

### Environment variables

| Variable | Description | Example |
| --- | --- | --- |
| `Converto__PdfEndpointUrl` | The URL of the PDF generation endpoint. | `http://localhost:3100/v1/pdf` |
| `Converto__TokenEndpointUrl` | The URL of the token generation endpoint. | `http://localhost:3100/token` |
| `Converto__ClientId` | The client ID for the token generation. | `id` |
| `Converto__ClientSecret` | The client secret for the token generation | `secret` |
| `Converto__DefaultScale` | The default scale for the PDF generation. | `1.0` |
| `Converto__DefaultPaperSize` | The default paper size for the PDF generation. | `A4` |
