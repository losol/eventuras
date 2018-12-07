using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class issuinguser3 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EvidenceDescription",
                table: "Certificates",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IssuingOrganizationName",
                table: "Certificates",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EvidenceDescription",
                table: "Certificates");

            migrationBuilder.DropColumn(
                name: "IssuingOrganizationName",
                table: "Certificates");
        }
    }
}
