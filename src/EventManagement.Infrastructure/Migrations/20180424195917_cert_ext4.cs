using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class cert_ext4 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CertificateEvidence_Certificates_CertificateId",
                table: "CertificateEvidence");

            migrationBuilder.DropForeignKey(
                name: "FK_CertificateEvidence_Registrations_RegistrationId",
                table: "CertificateEvidence");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CertificateEvidence",
                table: "CertificateEvidence");

            migrationBuilder.RenameTable(
                name: "CertificateEvidence",
                newName: "CertificateEvidences");

            migrationBuilder.RenameIndex(
                name: "IX_CertificateEvidence_RegistrationId",
                table: "CertificateEvidences",
                newName: "IX_CertificateEvidences_RegistrationId");

            migrationBuilder.RenameIndex(
                name: "IX_CertificateEvidence_CertificateId",
                table: "CertificateEvidences",
                newName: "IX_CertificateEvidences_CertificateId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CertificateEvidences",
                table: "CertificateEvidences",
                column: "CertificateEvidenceId");

            migrationBuilder.AddForeignKey(
                name: "FK_CertificateEvidences_Certificates_CertificateId",
                table: "CertificateEvidences",
                column: "CertificateId",
                principalTable: "Certificates",
                principalColumn: "CertificateId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CertificateEvidences_Registrations_RegistrationId",
                table: "CertificateEvidences",
                column: "RegistrationId",
                principalTable: "Registrations",
                principalColumn: "RegistrationId",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CertificateEvidences_Certificates_CertificateId",
                table: "CertificateEvidences");

            migrationBuilder.DropForeignKey(
                name: "FK_CertificateEvidences_Registrations_RegistrationId",
                table: "CertificateEvidences");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CertificateEvidences",
                table: "CertificateEvidences");

            migrationBuilder.RenameTable(
                name: "CertificateEvidences",
                newName: "CertificateEvidence");

            migrationBuilder.RenameIndex(
                name: "IX_CertificateEvidences_RegistrationId",
                table: "CertificateEvidence",
                newName: "IX_CertificateEvidence_RegistrationId");

            migrationBuilder.RenameIndex(
                name: "IX_CertificateEvidences_CertificateId",
                table: "CertificateEvidence",
                newName: "IX_CertificateEvidence_CertificateId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CertificateEvidence",
                table: "CertificateEvidence",
                column: "CertificateEvidenceId");

            migrationBuilder.AddForeignKey(
                name: "FK_CertificateEvidence_Certificates_CertificateId",
                table: "CertificateEvidence",
                column: "CertificateId",
                principalTable: "Certificates",
                principalColumn: "CertificateId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CertificateEvidence_Registrations_RegistrationId",
                table: "CertificateEvidence",
                column: "RegistrationId",
                principalTable: "Registrations",
                principalColumn: "RegistrationId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
