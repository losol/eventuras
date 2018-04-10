using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class YourMigrationClassName : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Orders_RegistrationId",
                table: "Orders");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_RegistrationId",
                table: "Orders",
                column: "RegistrationId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Orders_RegistrationId",
                table: "Orders");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_RegistrationId",
                table: "Orders",
                column: "RegistrationId",
                unique: true);
        }
    }
}
