using Microsoft.EntityFrameworkCore.Migrations;

namespace Eventuras.Infrastructure.Migrations
{
    public partial class ProductVisibilityAndEventCollectionArchivedFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Visibility",
                table: "Products",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AlterColumn<string>(
                name: "ExternalInvoiceId",
                table: "Invoices",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<bool>(
                name: "Archived",
                table: "EventCollections",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Visibility",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Archived",
                table: "EventCollections");

            migrationBuilder.AlterColumn<string>(
                name: "ExternalInvoiceId",
                table: "Invoices",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}
