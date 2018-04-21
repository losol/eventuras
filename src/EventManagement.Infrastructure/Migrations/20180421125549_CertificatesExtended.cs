using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class CertificatesExtended : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Certificates_Registrations_CertificateId",
                table: "Certificates");

            migrationBuilder.DropForeignKey(
                name: "FK_Certificates_EventInfos_EventInfoId",
                table: "Certificates");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Certificates",
                table: "Certificates");

            migrationBuilder.DropIndex(
                name: "IX_Certificates_EventInfoId",
                table: "Certificates");

            migrationBuilder.DropColumn(
                name: "EventInfoId",
                table: "Certificates");

            migrationBuilder.RenameColumn(
                name: "CertificateGuid",
                table: "Certificates",
                newName: "SecretGuid");

            migrationBuilder.RenameColumn(
                name: "AuthCode",
                table: "Certificates",
                newName: "PublicGuid");

            migrationBuilder.AddColumn<int>(
                name: "CertificateId",
                table: "Registrations",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "Certificates",
                nullable: false,
                defaultValue: 0)
                .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AddColumn<string>(
                name: "RecipientEmail",
                table: "Certificates",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Issuer_OrganizationUrl",
                table: "Certificates",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Certificates",
                table: "Certificates",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Registrations_CertificateId",
                table: "Registrations",
                column: "CertificateId");

            migrationBuilder.AddForeignKey(
                name: "FK_Registrations_Certificates_CertificateId",
                table: "Registrations",
                column: "CertificateId",
                principalTable: "Certificates",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Registrations_Certificates_CertificateId",
                table: "Registrations");

            migrationBuilder.DropIndex(
                name: "IX_Registrations_CertificateId",
                table: "Registrations");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Certificates",
                table: "Certificates");

            migrationBuilder.DropColumn(
                name: "CertificateId",
                table: "Registrations");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "Certificates");

            migrationBuilder.DropColumn(
                name: "RecipientEmail",
                table: "Certificates");

            migrationBuilder.DropColumn(
                name: "Issuer_OrganizationUrl",
                table: "Certificates");

            migrationBuilder.RenameColumn(
                name: "SecretGuid",
                table: "Certificates",
                newName: "CertificateGuid");

            migrationBuilder.RenameColumn(
                name: "PublicGuid",
                table: "Certificates",
                newName: "AuthCode");

            migrationBuilder.AddColumn<int>(
                name: "EventInfoId",
                table: "Certificates",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Certificates",
                table: "Certificates",
                column: "CertificateId");

            migrationBuilder.CreateIndex(
                name: "IX_Certificates_EventInfoId",
                table: "Certificates",
                column: "EventInfoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Certificates_Registrations_CertificateId",
                table: "Certificates",
                column: "CertificateId",
                principalTable: "Registrations",
                principalColumn: "RegistrationId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Certificates_EventInfos_EventInfoId",
                table: "Certificates",
                column: "EventInfoId",
                principalTable: "EventInfos",
                principalColumn: "EventInfoId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
