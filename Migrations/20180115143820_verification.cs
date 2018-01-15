using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Migrations
{
    public partial class verification : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "VerificationCode",
                table: "Registrations",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Verified",
                table: "Registrations",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<decimal>(
                name: "Price",
                table: "EventInfos",
                nullable: true,
                oldClrType: typeof(decimal));

            migrationBuilder.AddColumn<bool>(
                name: "ManageRegistrations",
                table: "EventInfos",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "VerificationCode",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "Verified",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "ManageRegistrations",
                table: "EventInfos");

            migrationBuilder.AlterColumn<decimal>(
                name: "Price",
                table: "EventInfos",
                nullable: false,
                oldClrType: typeof(decimal),
                oldNullable: true);
        }
    }
}
