using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class issuinguser2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "IssuingUserId",
                table: "Certificates",
                nullable: true,
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Certificates_IssuingUserId",
                table: "Certificates",
                column: "IssuingUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Certificates_AspNetUsers_IssuingUserId",
                table: "Certificates",
                column: "IssuingUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Certificates_AspNetUsers_IssuingUserId",
                table: "Certificates");

            migrationBuilder.DropIndex(
                name: "IX_Certificates_IssuingUserId",
                table: "Certificates");

            migrationBuilder.AlterColumn<string>(
                name: "IssuingUserId",
                table: "Certificates",
                nullable: true,
                oldClrType: typeof(string),
                oldNullable: true);
        }
    }
}
