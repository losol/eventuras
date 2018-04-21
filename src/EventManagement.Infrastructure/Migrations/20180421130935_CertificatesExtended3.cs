using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class CertificatesExtended3 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SecretGuid",
                table: "Certificates",
                newName: "CertificateGuid");

            migrationBuilder.RenameColumn(
                name: "Guid",
                table: "Certificates",
                newName: "Auth");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Certificates",
                newName: "CertificateId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CertificateGuid",
                table: "Certificates",
                newName: "SecretGuid");

            migrationBuilder.RenameColumn(
                name: "Auth",
                table: "Certificates",
                newName: "Guid");

            migrationBuilder.RenameColumn(
                name: "CertificateId",
                table: "Certificates",
                newName: "Id");
        }
    }
}
