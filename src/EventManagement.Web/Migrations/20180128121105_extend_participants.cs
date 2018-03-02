using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Migrations
{
    public partial class extend_participants : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CustomerEmail",
                table: "Registrations",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerInvoiceReference",
                table: "Registrations",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerName",
                table: "Registrations",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerVatNumber",
                table: "Registrations",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ParticipantEmployer",
                table: "Registrations",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ParticipantName",
                table: "Registrations",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Free",
                table: "EventInfos",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomerEmail",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "CustomerInvoiceReference",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "CustomerName",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "CustomerVatNumber",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "ParticipantEmployer",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "ParticipantName",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "Free",
                table: "EventInfos");
        }
    }
}
