using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class cert_ext3 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CertificateEvidence_Certificates_CertificateId",
                table: "CertificateEvidence");

            migrationBuilder.AlterColumn<int>(
                name: "CertificateId",
                table: "CertificateEvidence",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_CertificateEvidence_Certificates_CertificateId",
                table: "CertificateEvidence",
                column: "CertificateId",
                principalTable: "Certificates",
                principalColumn: "CertificateId",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CertificateEvidence_Certificates_CertificateId",
                table: "CertificateEvidence");

            migrationBuilder.AlterColumn<int>(
                name: "CertificateId",
                table: "CertificateEvidence",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AddForeignKey(
                name: "FK_CertificateEvidence_Certificates_CertificateId",
                table: "CertificateEvidence",
                column: "CertificateId",
                principalTable: "Certificates",
                principalColumn: "CertificateId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
