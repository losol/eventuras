using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class EventsInCerts : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EventInfoId",
                table: "Certificates",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Certificates_EventInfoId",
                table: "Certificates",
                column: "EventInfoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Certificates_EventInfos_EventInfoId",
                table: "Certificates",
                column: "EventInfoId",
                principalTable: "EventInfos",
                principalColumn: "EventInfoId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Certificates_EventInfos_EventInfoId",
                table: "Certificates");

            migrationBuilder.DropIndex(
                name: "IX_Certificates_EventInfoId",
                table: "Certificates");

            migrationBuilder.DropColumn(
                name: "EventInfoId",
                table: "Certificates");
        }
    }
}
