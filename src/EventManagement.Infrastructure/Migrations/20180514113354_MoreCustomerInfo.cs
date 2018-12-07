using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class MoreCustomerInfo : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CustomerAddress",
                table: "Registrations",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerCity",
                table: "Registrations",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerCountry",
                table: "Registrations",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerZip",
                table: "Registrations",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomerAddress",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "CustomerCity",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "CustomerCountry",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "CustomerZip",
                table: "Registrations");
        }
    }
}
