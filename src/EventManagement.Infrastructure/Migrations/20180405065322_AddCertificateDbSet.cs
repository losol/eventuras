using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class AddCertificateDbSet : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Certificate_Registrations_CertificateId",
                table: "Certificate");

            migrationBuilder.DropForeignKey(
                name: "FK_Certificate_AspNetUsers_RecipientUserId",
                table: "Certificate");

            migrationBuilder.DropForeignKey(
                name: "FK_Certificate_AspNetUsers_Issuer_IssuedByUserId",
                table: "Certificate");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Certificate",
                table: "Certificate");

            migrationBuilder.RenameTable(
                name: "Certificate",
                newName: "Certificates");

            migrationBuilder.RenameIndex(
                name: "IX_Certificate_Issuer_IssuedByUserId",
                table: "Certificates",
                newName: "IX_Certificates_Issuer_IssuedByUserId");

            migrationBuilder.RenameIndex(
                name: "IX_Certificate_RecipientUserId",
                table: "Certificates",
                newName: "IX_Certificates_RecipientUserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Certificates",
                table: "Certificates",
                column: "CertificateId");

            migrationBuilder.AddForeignKey(
                name: "FK_Certificates_Registrations_CertificateId",
                table: "Certificates",
                column: "CertificateId",
                principalTable: "Registrations",
                principalColumn: "RegistrationId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Certificates_AspNetUsers_RecipientUserId",
                table: "Certificates",
                column: "RecipientUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Certificates_AspNetUsers_Issuer_IssuedByUserId",
                table: "Certificates",
                column: "Issuer_IssuedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Certificates_Registrations_CertificateId",
                table: "Certificates");

            migrationBuilder.DropForeignKey(
                name: "FK_Certificates_AspNetUsers_RecipientUserId",
                table: "Certificates");

            migrationBuilder.DropForeignKey(
                name: "FK_Certificates_AspNetUsers_Issuer_IssuedByUserId",
                table: "Certificates");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Certificates",
                table: "Certificates");

            migrationBuilder.RenameTable(
                name: "Certificates",
                newName: "Certificate");

            migrationBuilder.RenameIndex(
                name: "IX_Certificates_Issuer_IssuedByUserId",
                table: "Certificate",
                newName: "IX_Certificate_Issuer_IssuedByUserId");

            migrationBuilder.RenameIndex(
                name: "IX_Certificates_RecipientUserId",
                table: "Certificate",
                newName: "IX_Certificate_RecipientUserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Certificate",
                table: "Certificate",
                column: "CertificateId");

            migrationBuilder.AddForeignKey(
                name: "FK_Certificate_Registrations_CertificateId",
                table: "Certificate",
                column: "CertificateId",
                principalTable: "Registrations",
                principalColumn: "RegistrationId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Certificate_AspNetUsers_RecipientUserId",
                table: "Certificate",
                column: "RecipientUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Certificate_AspNetUsers_Issuer_IssuedByUserId",
                table: "Certificate",
                column: "Issuer_IssuedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
