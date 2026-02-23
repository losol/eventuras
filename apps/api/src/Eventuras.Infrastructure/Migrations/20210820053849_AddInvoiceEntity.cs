using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace Eventuras.Infrastructure.Migrations
{
    public partial class AddInvoiceEntity : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "InvoiceId",
                table: "Orders",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Invoices",
                columns: table => new
                {
                    InvoiceId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ExternalInvoiceId = table.Column<string>(type: "text", nullable: false),
                    Paid = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Invoices", x => x.InvoiceId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_InvoiceId",
                table: "Orders",
                column: "InvoiceId");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Invoices_InvoiceId",
                table: "Orders",
                column: "InvoiceId",
                principalTable: "Invoices",
                principalColumn: "InvoiceId",
                onDelete: ReferentialAction.Restrict);

            // add temporarily column to link orders to the new invoices
            migrationBuilder.Sql(@"alter table ""Invoices"" add column ""OrderId"" int;");

            // insert data from order into invoices
            migrationBuilder.Sql(@"insert into ""Invoices""
(""ExternalInvoiceId"", ""Paid"", ""OrderId"")
select ""ExternalInvoiceId"", ""Paid"", ""OrderId""
from ""Orders""
where ""Status"" = 2
and ""ExternalInvoiceId"" is not null;");

            // make a link between new invoices and old orders
            migrationBuilder.Sql(@"update ""Orders""
set ""InvoiceId"" = i.""InvoiceId""
from ""Orders"" o
join ""Invoices"" i
on o.""OrderId"" = i.""OrderId""
where o.""Status"" = 2
and o.""ExternalInvoiceId"" is not null;
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Invoices_InvoiceId",
                table: "Orders");

            migrationBuilder.DropTable(
                name: "Invoices");

            migrationBuilder.DropIndex(
                name: "IX_Orders_InvoiceId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "InvoiceId",
                table: "Orders");
        }
    }
}
