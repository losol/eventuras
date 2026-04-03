using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eventuras.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUuidToOrderAndRegistration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "Uuid",
                table: "Registrations",
                type: "uuid",
                nullable: false,
                defaultValueSql: "uuidv7()");

            migrationBuilder.AddColumn<Guid>(
                name: "Uuid",
                table: "Orders",
                type: "uuid",
                nullable: false,
                defaultValueSql: "uuidv7()");

            // Backfill existing rows with unique UUIDs
            migrationBuilder.Sql("""UPDATE "Registrations" SET "Uuid" = uuidv7();""");
            migrationBuilder.Sql("""UPDATE "Orders" SET "Uuid" = uuidv7();""");

            migrationBuilder.CreateIndex(
                name: "IX_Registrations_Uuid",
                table: "Registrations",
                column: "Uuid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Uuid",
                table: "Orders",
                column: "Uuid",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Registrations_Uuid",
                table: "Registrations");

            migrationBuilder.DropIndex(
                name: "IX_Orders_Uuid",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Uuid",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "Uuid",
                table: "Orders");
        }
    }
}
