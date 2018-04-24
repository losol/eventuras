using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class cert_ext : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CertificateGuid",
                table: "Certificates",
                newName: "Guid");

            migrationBuilder.AddColumn<string>(
                name: "IssuedInCity",
                table: "Certificates",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CertificateEvidence",
                columns: table => new
                {
                    CertificateEvidenceId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CertificateId = table.Column<int>(nullable: true),
                    RegistrationId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CertificateEvidence", x => x.CertificateEvidenceId);
                    table.ForeignKey(
                        name: "FK_CertificateEvidence_Certificates_CertificateId",
                        column: x => x.CertificateId,
                        principalTable: "Certificates",
                        principalColumn: "CertificateId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CertificateEvidence_Registrations_RegistrationId",
                        column: x => x.RegistrationId,
                        principalTable: "Registrations",
                        principalColumn: "RegistrationId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CertificateEvidence_CertificateId",
                table: "CertificateEvidence",
                column: "CertificateId");

            migrationBuilder.CreateIndex(
                name: "IX_CertificateEvidence_RegistrationId",
                table: "CertificateEvidence",
                column: "RegistrationId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CertificateEvidence");

            migrationBuilder.DropColumn(
                name: "IssuedInCity",
                table: "Certificates");

            migrationBuilder.RenameColumn(
                name: "Guid",
                table: "Certificates",
                newName: "CertificateGuid");
        }
    }
}
