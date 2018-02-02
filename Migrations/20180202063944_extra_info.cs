using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Migrations
{
    public partial class extra_info : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Log",
                table: "Registrations",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AdditionInformationRequest",
                table: "EventInfos",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WelcomeLetter",
                table: "EventInfos",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Log",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "AdditionInformationRequest",
                table: "EventInfos");

            migrationBuilder.DropColumn(
                name: "WelcomeLetter",
                table: "EventInfos");
        }
    }
}
