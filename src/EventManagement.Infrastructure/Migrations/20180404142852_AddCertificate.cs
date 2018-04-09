using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace losol.EventManagement.Infrastructure.Migrations
{
    public partial class AddCertificate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Certificate",
                columns: table => new
                {
                    CertificateId = table.Column<int>(nullable: false),
                    AuthCode = table.Column<Guid>(nullable: false),
                    CertificateGuid = table.Column<Guid>(nullable: false),
                    Description = table.Column<string>(nullable: true),
                    RecipientName = table.Column<string>(nullable: true),
                    RecipientUserId = table.Column<string>(nullable: true),
                    Title = table.Column<string>(nullable: false),
                    Issuer_IssuedByName = table.Column<string>(nullable: true),
                    Issuer_IssuedByUserId = table.Column<string>(nullable: true),
                    Issuer_OrganizationId = table.Column<int>(nullable: false),
                    Issuer_OrganizationLogoUrl = table.Column<string>(nullable: true),
                    Issuer_OrganizationName = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Certificate", x => x.CertificateId);
                    table.ForeignKey(
                        name: "FK_Certificate_Registrations_CertificateId",
                        column: x => x.CertificateId,
                        principalTable: "Registrations",
                        principalColumn: "RegistrationId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Certificate_AspNetUsers_RecipientUserId",
                        column: x => x.RecipientUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Certificate_AspNetUsers_Issuer_IssuedByUserId",
                        column: x => x.Issuer_IssuedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Certificate_RecipientUserId",
                table: "Certificate",
                column: "RecipientUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Certificate_Issuer_IssuedByUserId",
                table: "Certificate",
                column: "Issuer_IssuedByUserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Certificate");
        }
    }
}
