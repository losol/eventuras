using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class payupdate2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PaymentProvider",
                table: "PaymentMethods");

            migrationBuilder.AddColumn<int>(
                name: "Provider",
                table: "PaymentMethods",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Provider",
                table: "PaymentMethods");

            migrationBuilder.AddColumn<string>(
                name: "PaymentProvider",
                table: "PaymentMethods",
                nullable: true);
        }
    }
}
