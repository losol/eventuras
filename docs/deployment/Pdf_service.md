# Converto PDF service

This service is responsible for converting HTML to PDF, and is using the [github/losol/converto](https://github.com/losol/converto) library.

## Configuration

The service is configured using the following environment variables:

in the table:

| Variable                   | Description                 | Example                           |
| -------------------------- | --------------------------- | --------------------------------- |
| `Converto__PdfEndpointUrl` | Url to the converto service | `https://converto.co/api/pdfcreo` |
| `Converto__ApiToken`       | API token                   | `abc`                             |
