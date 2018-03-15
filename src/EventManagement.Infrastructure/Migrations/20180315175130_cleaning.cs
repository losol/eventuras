using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class cleaning : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Orders_RegistrationId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Free",
                table: "EventInfos");

            migrationBuilder.DropColumn(
                name: "VatPercent",
                table: "EventInfos");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_RegistrationId",
                table: "Orders",
                column: "RegistrationId",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Orders_RegistrationId",
                table: "Orders");

            migrationBuilder.AddColumn<bool>(
                name: "Free",
                table: "EventInfos",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "VatPercent",
                table: "EventInfos",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_RegistrationId",
                table: "Orders",
                column: "RegistrationId");
        }
    }
}
