using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class cert_org : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IssuingOrganizationId",
                table: "Certificates",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Certificates_IssuingOrganizationId",
                table: "Certificates",
                column: "IssuingOrganizationId");

            migrationBuilder.AddForeignKey(
                name: "FK_Certificates_Organizations_IssuingOrganizationId",
                table: "Certificates",
                column: "IssuingOrganizationId",
                principalTable: "Organizations",
                principalColumn: "OrganizationId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Certificates_Organizations_IssuingOrganizationId",
                table: "Certificates");

            migrationBuilder.DropIndex(
                name: "IX_Certificates_IssuingOrganizationId",
                table: "Certificates");

            migrationBuilder.DropColumn(
                name: "IssuingOrganizationId",
                table: "Certificates");
        }
    }
}
