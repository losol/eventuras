using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class cert_multiple3 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Certificates_Registrations_RegistrationId",
                table: "Certificates");

            migrationBuilder.DropTable(
                name: "CertificateRegistrations");

            migrationBuilder.DropIndex(
                name: "IX_Certificates_RegistrationId",
                table: "Certificates");

            migrationBuilder.DropColumn(
                name: "RegistrationId",
                table: "Certificates");

            migrationBuilder.AddColumn<int>(
                name: "CertificateId",
                table: "Registrations",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Registrations_CertificateId",
                table: "Registrations",
                column: "CertificateId");

            migrationBuilder.AddForeignKey(
                name: "FK_Registrations_Certificates_CertificateId",
                table: "Registrations",
                column: "CertificateId",
                principalTable: "Certificates",
                principalColumn: "CertificateId",
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

            migrationBuilder.DropColumn(
                name: "CertificateId",
                table: "Registrations");

            migrationBuilder.AddColumn<int>(
                name: "RegistrationId",
                table: "Certificates",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CertificateRegistrations",
                columns: table => new
                {
                    CertificateId = table.Column<int>(nullable: false),
                    RegistrationId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CertificateRegistrations", x => new { x.CertificateId, x.RegistrationId });
                    table.ForeignKey(
                        name: "FK_CertificateRegistrations_Certificates_CertificateId",
                        column: x => x.CertificateId,
                        principalTable: "Certificates",
                        principalColumn: "CertificateId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CertificateRegistrations_Registrations_RegistrationId",
                        column: x => x.RegistrationId,
                        principalTable: "Registrations",
                        principalColumn: "RegistrationId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Certificates_RegistrationId",
                table: "Certificates",
                column: "RegistrationId");

            migrationBuilder.CreateIndex(
                name: "IX_CertificateRegistrations_RegistrationId",
                table: "CertificateRegistrations",
                column: "RegistrationId");

            migrationBuilder.AddForeignKey(
                name: "FK_Certificates_Registrations_RegistrationId",
                table: "Certificates",
                column: "RegistrationId",
                principalTable: "Registrations",
                principalColumn: "RegistrationId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
