using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class registration_extended : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Registrations",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Registrations",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Registrations");
        }
    }
}
