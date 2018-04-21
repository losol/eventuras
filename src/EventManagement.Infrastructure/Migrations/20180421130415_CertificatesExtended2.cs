using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class CertificatesExtended2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CertificateId",
                table: "Certificates");

            migrationBuilder.RenameColumn(
                name: "PublicGuid",
                table: "Certificates",
                newName: "Guid");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Guid",
                table: "Certificates",
                newName: "PublicGuid");

            migrationBuilder.AddColumn<int>(
                name: "CertificateId",
                table: "Certificates",
                nullable: false,
                defaultValue: 0);
        }
    }
}
