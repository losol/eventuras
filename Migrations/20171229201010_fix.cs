using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Migrations
{
    public partial class fix : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Registrations_EventInfos_EventInfoId",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "EventId",
                table: "Registrations");

            migrationBuilder.AlterColumn<int>(
                name: "EventInfoId",
                table: "Registrations",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Registrations_EventInfos_EventInfoId",
                table: "Registrations",
                column: "EventInfoId",
                principalTable: "EventInfos",
                principalColumn: "EventInfoId",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Registrations_EventInfos_EventInfoId",
                table: "Registrations");

            migrationBuilder.AlterColumn<int>(
                name: "EventInfoId",
                table: "Registrations",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AddColumn<int>(
                name: "EventId",
                table: "Registrations",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddForeignKey(
                name: "FK_Registrations_EventInfos_EventInfoId",
                table: "Registrations",
                column: "EventInfoId",
                principalTable: "EventInfos",
                principalColumn: "EventInfoId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
