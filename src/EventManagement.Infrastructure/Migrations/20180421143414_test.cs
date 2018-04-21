using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class test : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Certificates_AspNetUsers_Issuer_IssuedByUserId",
                table: "Certificates");

            migrationBuilder.DropIndex(
                name: "IX_Certificates_Issuer_IssuedByUserId",
                table: "Certificates");

            migrationBuilder.DropColumn(
                name: "Issuer_IssuedByUserId",
                table: "Certificates");

            migrationBuilder.DropColumn(
                name: "Issuer_IssuedInCity",
                table: "Certificates");

            migrationBuilder.DropColumn(
                name: "Issuer_OrganizationId",
                table: "Certificates");

            migrationBuilder.DropColumn(
                name: "Issuer_OrganizationLogoUrl",
                table: "Certificates");

            migrationBuilder.DropColumn(
                name: "Issuer_OrganizationName",
                table: "Certificates");

            migrationBuilder.DropColumn(
                name: "Issuer_OrganizationUrl",
                table: "Certificates");

            migrationBuilder.RenameColumn(
                name: "Issuer_IssuedByName",
                table: "Certificates",
                newName: "IssuedByName");

            migrationBuilder.RenameColumn(
                name: "CreatedOn",
                table: "Certificates",
                newName: "IssuedDate");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IssuedByName",
                table: "Certificates",
                newName: "Issuer_IssuedByName");

            migrationBuilder.RenameColumn(
                name: "IssuedDate",
                table: "Certificates",
                newName: "CreatedOn");

            migrationBuilder.AddColumn<string>(
                name: "Issuer_IssuedByUserId",
                table: "Certificates",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Issuer_IssuedInCity",
                table: "Certificates",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Issuer_OrganizationId",
                table: "Certificates",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Issuer_OrganizationLogoUrl",
                table: "Certificates",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Issuer_OrganizationName",
                table: "Certificates",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Issuer_OrganizationUrl",
                table: "Certificates",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Certificates_Issuer_IssuedByUserId",
                table: "Certificates",
                column: "Issuer_IssuedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Certificates_AspNetUsers_Issuer_IssuedByUserId",
                table: "Certificates",
                column: "Issuer_IssuedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
